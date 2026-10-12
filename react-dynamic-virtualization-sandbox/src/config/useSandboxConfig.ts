import { useCallback, useState } from "react"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { scenarioControls } from "./controlAvailability"
import { defaultConfig } from "./defaultConfig"
import { sandboxPresets } from "./presets"
import type { SandboxConfig } from "./types"
import type { SandboxPreset } from "./presets"

type ScenarioConfigState = { config: SandboxConfig; preset: SandboxPreset }

export function useSandboxConfig(scenario: ScenarioId) {
  const [states, setStates] = useState<Partial<Record<ScenarioId, ScenarioConfigState>>>({})
  const { config, preset } = states[scenario] ?? { config: defaultConfig, preset: sandboxPresets[0] }

  const updateConfig = useCallback(<K extends keyof SandboxConfig>(
    key: K,
    value: SandboxConfig[K],
  ) => {
    if (!scenarioControls[scenario].some((field) => field === key)) return
    setStates((current) => ({
      ...current,
      [scenario]: {
        preset: current[scenario]?.preset ?? preset,
        config: { ...(current[scenario]?.config ?? defaultConfig), [key]: value },
      },
    }))
  }, [scenario, preset])

  const applyPreset = useCallback((preset: SandboxPreset) => {
    setStates((current) => ({ ...current, [scenario]: { preset, config: preset.config } }))
  }, [scenario])

  const resetConfig = useCallback(() => {
    setStates((current) => ({ ...current, [scenario]: { preset, config: preset.config } }))
  }, [scenario, preset])

  return {
    config,
    preset,
    updateConfig,
    applyPreset,
    resetConfig,
  }
}
