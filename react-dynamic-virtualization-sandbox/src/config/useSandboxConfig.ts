import { useState } from "react"
import { defaultConfig } from "./defaultConfig"
import type { SandboxConfig } from "./types"

export function useSandboxConfig() {
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

  function resetConfig() {
    setConfig(defaultConfig)
  }

  return {
    config,
    updateConfig,
    resetConfig,
  }
}
