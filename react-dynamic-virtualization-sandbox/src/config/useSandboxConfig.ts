import { useCallback, useState } from "react"
import { defaultConfig } from "./defaultConfig"
import { sandboxPresets } from "./presets"
import type { SandboxConfig } from "./types"
import type { SandboxPreset } from "./presets"

export function useSandboxConfig() {
  const [preset, setPreset] = useState<SandboxPreset>(sandboxPresets[0])
  const [config, setConfig] = useState<SandboxConfig>(defaultConfig)

  const updateConfig = useCallback(<K extends keyof SandboxConfig>(
    key: K,
    value: SandboxConfig[K],
  ) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }))
  }, [])

  const applyPreset = useCallback((preset: SandboxPreset) => {
    setPreset(preset)
    setConfig(preset.config)
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(preset.config)
  }, [preset.config])

  return {
    config,
    updateConfig,
    applyPreset,
    resetConfig,
  }
}
