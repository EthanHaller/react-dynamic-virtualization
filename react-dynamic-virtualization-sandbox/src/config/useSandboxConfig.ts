import { useState } from "react"
import { defaultConfig } from "./defaultConfig"
import { sandboxPresets } from "./presets"
import type { SandboxConfig } from "./types"
import type { SandboxPreset } from "./presets"

export function useSandboxConfig() {
  const [preset, setPreset] = useState<SandboxPreset>(sandboxPresets[0])
  const [config, setConfig] = useState<SandboxConfig>(defaultConfig)

  function updateConfig<K extends keyof SandboxConfig>(
    key: K,
    value: SandboxConfig[K],
  ) {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function applyPreset(preset: SandboxPreset) {
    setPreset(preset)
    setConfig(preset.config)
  }

  function resetConfig() {
    setConfig(preset.config)
  }

  return {
    config,
    updateConfig,
    applyPreset,
    resetConfig,
  }
}
