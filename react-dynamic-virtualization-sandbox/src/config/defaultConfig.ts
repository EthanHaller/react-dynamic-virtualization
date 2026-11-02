import type { ScenarioId } from "../routing/scenarioRoutes"
import type { SandboxConfig } from "./types"

export const defaultConfig: SandboxConfig = {
  providerId: "react-dynamic-virtualization",
  estimatedItemHeight: 80,
  bufferSize: 200,
  minHeight: 50,
  maxHeight: 300,
  itemCount: 20,
  itemSize: 80,
  overscan: 2,
  listHeight: 500,
  workloadSeed: 1,
  payloadUpdateBatchSize: 1,
  payloadUpdateInterval: 100,
}

export function getScenarioDefaults(scenario: ScenarioId): SandboxConfig {
  return scenario === "changing-heights" ? { ...defaultConfig, itemCount: 10_000, listHeight: 600 } : defaultConfig
}
