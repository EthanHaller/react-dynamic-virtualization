import { getProviderDefinition, type ProviderId } from "../providers/providerDefinitions"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { defaultConfig, getScenarioDefaults } from "./defaultConfig"
import type { SandboxConfig } from "./types"

export type SandboxPreset = {
  name: string
  description: string
  config: SandboxConfig
}

export const sandboxPresets: SandboxPreset[] = [
  {
    name: "Default",
    description: "Balanced workload for exploring the scenarios.",
    config: {
      ...defaultConfig,
      minHeight: 50,
      maxHeight: 300,
      itemCount: 20,
      itemSize: 80,
      overscan: 2,
      listHeight: 500,
    },
  },
  {
    name: "Large List",
    description: "10,000 items with a small viewport.",
    config: {
      ...defaultConfig,
      minHeight: 50,
      maxHeight: 300,
      itemCount: 10_000,
      itemSize: 80,
      overscan: 5,
      listHeight: 400,
    },
  },
  {
    name: "High Overscan",
    description: "More items rendered around the viewport.",
    config: {
      ...defaultConfig,
      minHeight: 50,
      maxHeight: 300,
      itemCount: 10_000,
      itemSize: 80,
      overscan: 50,
      listHeight: 500,
    },
  },
  {
    name: "Rapid Changes",
    description: "Frequently changing item heights.",
    config: {
      ...defaultConfig,
      minHeight: 50,
      maxHeight: 300,
      itemCount: 10_000,
      itemSize: 80,
      overscan: 5,
      listHeight: 600,
      payloadUpdateInterval: 16,
      payloadUpdateBatchSize: 4,
    },
  },
]

export function getAvailableSandboxPresets(scenario: ScenarioId, providerId: ProviderId) {
  const supportsItemOverscan = getProviderDefinition(providerId).settings.some((setting) => setting.field === "overscan")
  return sandboxPresets.filter((preset) =>
    (scenario === "changing-heights" || preset.name !== "Rapid Changes") &&
    (supportsItemOverscan || preset.name !== "High Overscan"),
  ).map((preset) => preset.name === "Default" ? { ...preset, config: getScenarioDefaults(scenario) } : preset)
}
