import { getProviderDefinition } from "../providers/providerDefinitions"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { scenarioControls } from "./controlAvailability"
import { getScenarioDefaults } from "./defaultConfig"
import { getAvailableSandboxPresets, type SandboxPreset } from "./presets"
import { usePersistedScenarioConfig } from "./usePersistedScenarioConfig"
import type { SandboxConfig } from "./types"

export function useSandboxConfig(scenario: ScenarioId) {
  const { config, persistScenarioConfig } = usePersistedScenarioConfig(scenario)
  const presetFields = [...scenarioControls[scenario], ...getProviderDefinition(config.providerId).settings.filter((setting) => setting.field === "overscan").map((setting) => setting.field)]
  const preset = getAvailableSandboxPresets(scenario, config.providerId).find((availablePreset) =>
    presetFields.every((configField) => availablePreset.config[configField] === config[configField]),
  ) ?? { name: "Custom", description: "Configuration from the URL.", config }

  function updateConfig<K extends keyof SandboxConfig>(key: K, value: SandboxConfig[K]) {
    if (key !== "providerId" && !scenarioControls[scenario].some((field) => field === key) && !getProviderDefinition(config.providerId).settings.some((setting) => setting.field === key)) return
    persistScenarioConfig({ ...config, [key]: value })
  }

  function applyPreset(selectedPreset: SandboxPreset) {
    persistScenarioConfig({ ...selectedPreset.config, providerId: config.providerId, estimatedItemHeight: config.estimatedItemHeight, bufferSize: config.bufferSize })
  }

  function restoreDefaultConfig() {
    persistScenarioConfig(getScenarioDefaults(scenario))
  }

  return { config, preset, updateConfig, applyPreset, restoreDefaultConfig }
}
