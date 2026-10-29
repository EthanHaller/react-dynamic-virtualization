import { getProviderDefinition, parseProviderId } from "../providers/providerDefinitions"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { scenarioControls } from "./controlAvailability"
import { defaultConfig } from "./defaultConfig"
import type { SandboxConfig } from "./types"

type ScenarioConfigParsers = { [K in keyof Omit<SandboxConfig, "providerId">]: (queryValue: string) => SandboxConfig[K] | undefined }

function createIntegerRangeParser(minimumValue: number, maximumValue: number) {
  return (queryValue: string) => {
    if (!/^\d+$/.test(queryValue)) return undefined
    const parsedNumber = Number(queryValue)
    return Number.isSafeInteger(parsedNumber) && parsedNumber >= minimumValue && parsedNumber <= maximumValue ? parsedNumber : undefined
  }
}

// Explicit bounds keep malformed URLs from allocating unbounded datasets or viewports.
const scenarioConfigParsers: ScenarioConfigParsers = {
  estimatedItemHeight: createIntegerRangeParser(1, 100_000),
  bufferSize: createIntegerRangeParser(0, 100_000),
  itemCount: createIntegerRangeParser(0, 100_000),
  overscan: createIntegerRangeParser(0, 100_000),
  listHeight: createIntegerRangeParser(100, 100_000),
  itemSize: createIntegerRangeParser(1, 100_000),
  minHeight: createIntegerRangeParser(50, 300),
  maxHeight: createIntegerRangeParser(50, 300),
  changeInterval: createIntegerRangeParser(100, 2_147_483_647),
  enableSizeChanges: (queryValue) => queryValue === "true" ? true : queryValue === "false" ? false : undefined,
}

export function parseScenarioConfig(scenario: ScenarioId, queryString: string): SandboxConfig {
  const queryParameters = new URLSearchParams(queryString)
  const providerValues = queryParameters.getAll("provider")
  const config = { ...defaultConfig, providerId: parseProviderId(providerValues.length === 1 ? providerValues[0] : null) }
  function applyValidatedConfigField<K extends keyof ScenarioConfigParsers>(configField: K) {
    const fieldQueryValues = queryParameters.getAll(configField)
    if (fieldQueryValues.length !== 1) return
    const validatedFieldValue = scenarioConfigParsers[configField](fieldQueryValues[0])
    if (validatedFieldValue !== undefined) config[configField] = validatedFieldValue
  }
  const providerSettingFields = getProviderDefinition(config.providerId).settings.map((setting) => setting.field)
  const configurationFields = [...scenarioControls[scenario], ...providerSettingFields]
  configurationFields.forEach(applyValidatedConfigField)
  if (scenario !== "fixed-heights" && scenario !== "variable-initial-heights" && config.itemCount === 0) {
    config.itemCount = defaultConfig.itemCount
  }
  return config
}

export function serializeScenarioConfig(scenario: ScenarioId, config: SandboxConfig): string {
  const queryParameters = new URLSearchParams()
  queryParameters.set("provider", config.providerId)
  const configurationFields = [...scenarioControls[scenario], ...getProviderDefinition(config.providerId).settings.map((setting) => setting.field)]
  for (const configField of configurationFields) queryParameters.set(configField, String(config[configField]))
  const validatedConfig = parseScenarioConfig(scenario, queryParameters.toString())
  const nonDefaultParameters = new URLSearchParams()
  if (validatedConfig.providerId !== defaultConfig.providerId) nonDefaultParameters.set("provider", validatedConfig.providerId)
  for (const configField of configurationFields) {
    if (validatedConfig[configField] !== defaultConfig[configField]) nonDefaultParameters.set(configField, String(validatedConfig[configField]))
  }
  const queryString = nonDefaultParameters.toString()
  return queryString ? `?${queryString}` : ""
}
