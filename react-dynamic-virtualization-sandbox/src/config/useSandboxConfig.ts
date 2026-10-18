import type { ScenarioId } from "../routing/scenarioRoutes"
import { scenarioControls } from "./controlAvailability"
import { defaultConfig } from "./defaultConfig"
import { sandboxPresets, type SandboxPreset } from "./presets"
import { usePersistedScenarioConfig } from "./usePersistedScenarioConfig"
import type { SandboxConfig } from "./types"

export function useSandboxConfig(scenario: ScenarioId) {
  const { config, persistScenarioConfig } = usePersistedScenarioConfig(scenario)
  const preset = sandboxPresets.find((availablePreset) =>
    scenarioControls[scenario].every((configField) => availablePreset.config[configField] === config[configField]),
  ) ?? { name: "Custom", description: "Configuration from the URL.", config }

  function updateConfig<K extends keyof SandboxConfig>(key: K, value: SandboxConfig[K]) {
    if (!scenarioControls[scenario].includes(key)) return
    persistScenarioConfig({ ...config, [key]: value })
  }

  function applyPreset(selectedPreset: SandboxPreset) {
    persistScenarioConfig(selectedPreset.config)
  }

  function restoreDefaultConfig() {
    persistScenarioConfig(defaultConfig)
  }

  return { config, preset, updateConfig, applyPreset, restoreDefaultConfig }
}
