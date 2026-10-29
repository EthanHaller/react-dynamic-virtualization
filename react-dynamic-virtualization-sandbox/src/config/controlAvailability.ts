import type { ScenarioId } from "../routing/scenarioRoutes"
import type { SandboxConfig } from "./types"

export type ScenarioConfigField = Exclude<keyof SandboxConfig, "providerId" | "overscan" | "estimatedItemHeight" | "bufferSize">

// Scenario fields only; provider-specific settings belong to the provider registry.
export const scenarioControls: Record<ScenarioId, readonly ScenarioConfigField[]> = {
  "fixed-heights": ["itemCount", "listHeight", "itemSize"],
  "variable-initial-heights": ["itemCount", "listHeight", "minHeight", "maxHeight"],
  "changing-heights": ["itemCount", "listHeight", "enableSizeChanges", "changeInterval"],
  "mutations-and-reordering": ["itemCount", "listHeight"],
  "drag-and-drop": ["itemCount", "listHeight"],
}
