import { getProviderDefinition, parseProviderId } from "../providers/providerDefinitions"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { getScenarioNumberConstraints, scenarioControls } from "./controlAvailability"
import { getScenarioDefaults } from "./defaultConfig"
import type { SandboxConfig } from "./types"

type ScenarioConfigParsers = { [K in keyof Omit<SandboxConfig, "providerId">]: (queryValue: string, scenario: ScenarioId) => SandboxConfig[K] | undefined }

function createIntegerRangeParser(minimumValue: number, maximumValue: number) {
  return (queryValue: string) => {
    if (!/^\d+$/.test(queryValue)) return undefined
    const parsedNumber = Number(queryValue)
    return Number.isSafeInteger(parsedNumber) && parsedNumber >= minimumValue && parsedNumber <= maximumValue ? parsedNumber : undefined
  }
}

function createScenarioIntegerParser(field: Parameters<typeof getScenarioNumberConstraints>[1]) {
  return (queryValue: string, scenario: ScenarioId) => {
    const { min, max } = getScenarioNumberConstraints(scenario, field)
    return createIntegerRangeParser(min, max)(queryValue)
  }
}

// Explicit bounds keep malformed URLs from allocating unbounded datasets or viewports.
const scenarioConfigParsers: ScenarioConfigParsers = {
  workloadSeed: createScenarioIntegerParser("workloadSeed"),
  payloadUpdateInterval: createScenarioIntegerParser("payloadUpdateInterval"),
  payloadUpdateBatchSize: createScenarioIntegerParser("payloadUpdateBatchSize"),
  estimatedItemHeight: createIntegerRangeParser(1, 100_000),
  bufferSize: createIntegerRangeParser(0, 100_000),
  itemCount: createScenarioIntegerParser("itemCount"),
  overscan: createIntegerRangeParser(0, 100_000),
  listHeight: createScenarioIntegerParser("listHeight"),
  itemSize: createScenarioIntegerParser("itemSize"),
  minHeight: createScenarioIntegerParser("minHeight"),
  maxHeight: createScenarioIntegerParser("maxHeight"),
}

export function parseScenarioConfig(scenario: ScenarioId, queryString: string): SandboxConfig {
  const defaultConfig = getScenarioDefaults(scenario)
  const queryParameters = new URLSearchParams(queryString)
  const providerValues = queryParameters.getAll("provider")
  const config = { ...defaultConfig, providerId: parseProviderId(providerValues.length === 1 ? providerValues[0] : null) }
  function applyValidatedConfigField<K extends keyof ScenarioConfigParsers>(configField: K) {
    const fieldQueryValues = queryParameters.getAll(configField)
    if (fieldQueryValues.length !== 1) return
    const validatedFieldValue = scenarioConfigParsers[configField](fieldQueryValues[0], scenario)
    if (validatedFieldValue !== undefined) config[configField] = validatedFieldValue
  }
  const providerSettingFields = getProviderDefinition(config.providerId).settings.map((setting) => setting.field)
  const configurationFields = [...scenarioControls[scenario], ...providerSettingFields]
  configurationFields.forEach(applyValidatedConfigField)
  return config
}

export function serializeScenarioConfig(scenario: ScenarioId, config: SandboxConfig): string {
  const defaultConfig = getScenarioDefaults(scenario)
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
