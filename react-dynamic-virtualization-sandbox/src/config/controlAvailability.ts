import type { ScenarioId } from "../routing/scenarioRoutes"
import type { SandboxConfig } from "./types"

export type ScenarioConfigField = Exclude<keyof SandboxConfig, "providerId" | "overscan" | "estimatedItemHeight" | "bufferSize">

// Scenario fields only; provider-specific settings belong to the provider registry.
export const scenarioControls: Record<ScenarioId, readonly ScenarioConfigField[]> = {
  "fixed-heights": ["itemCount", "listHeight", "itemSize"],
  "variable-initial-heights": ["itemCount", "listHeight", "minHeight", "maxHeight"],
  "changing-heights": ["itemCount", "listHeight", "workloadSeed", "payloadUpdateBatchSize", "payloadUpdateInterval"],
  "mutations-and-reordering": ["itemCount", "listHeight"],
  "drag-and-drop": ["itemCount", "listHeight"],
}

const scenarioNumberConstraints = {
  itemCount: { min: 0, max: 100_000 },
  listHeight: { min: 100, max: 100_000 },
  itemSize: { min: 1, max: 100_000 },
  minHeight: { min: 50, max: 300 },
  maxHeight: { min: 50, max: 300 },
  workloadSeed: { min: 0, max: 4_294_967_295 },
  payloadUpdateInterval: { min: 16, max: 1_000 },
  payloadUpdateBatchSize: { min: 1, max: 1_000 },
} as const

export function getScenarioNumberConstraints(scenario: ScenarioId, field: keyof typeof scenarioNumberConstraints) {
  const constraints = scenarioNumberConstraints[field]
  if (field !== "itemCount") return constraints
  const min = scenario === "changing-heights" ? 1_000
    : scenario === "fixed-heights" || scenario === "variable-initial-heights" ? 0 : 1
  return { ...constraints, min }
}
