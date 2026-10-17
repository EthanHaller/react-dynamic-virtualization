import { createItems } from "./createItems"
import type { SandboxItem } from "./types"

// Repeating positions within the configured height range, from minimum to maximum.
const heightPattern = [
  0, 0.75, 0.25, 1, 0.5, 0.125, 0.875, 0.375,
  0.625, 0.92, 0.08, 0.46, 0.68, 0.21, 0.83, 0.34,
  0.57, 0.15, 0.97, 0.42, 0.71, 0.04, 0.54, 0.88,
  0.29, 0.63, 0.18, 0.79, 0.39, 0.95, 0.11, 0.52,
] as const

export type HeightConfig = { itemCount: number; minHeight: number; maxHeight: number }
export type HeightItem = SandboxItem & { height: number }

/** Repeats a fixed pattern scaled to inclusive [minHeight, maxHeight], rounded to pixels.
 * Equal bounds give constant heights. Each stable item ID owns its height.
 * Generation has no rendering/provider dependencies.
 */
export function createHeightItems(config: HeightConfig): HeightItem[] {
  return createItems(config.itemCount).map((item) => ({
    ...item,
    height: config.minHeight + Math.round(
      heightPattern[item.index % heightPattern.length] * (config.maxHeight - config.minHeight),
    ),
  }))
}
