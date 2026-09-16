import type { SandboxConfig } from "./types"

export const defaultConfig: SandboxConfig = {
  itemCount: 10_000,
  itemSizing: "variable",
  itemSize: 80,
  minItemSize: 40,
  maxItemSize: 160,
  overscan: 5,
  listHeight: 500,
}
