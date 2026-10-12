import type { ScenarioId } from "../routing/scenarioRoutes"
import type { SandboxConfig } from "./types"

// Explicit allowlists: new fields must be opted into each scenario.
export const scenarioControls: Record<ScenarioId, readonly (keyof SandboxConfig)[]> = {
  "fixed-heights": ["itemCount", "overscan", "listHeight", "itemSize"],
  "variable-initial-heights": ["itemCount", "overscan", "listHeight"],
  "changing-heights": ["itemCount", "overscan", "listHeight", "enableSizeChanges", "changeInterval"],
  "mutations-and-reordering": ["itemCount", "overscan", "listHeight"],
  "drag-and-drop": ["itemCount", "overscan", "listHeight"],
}
