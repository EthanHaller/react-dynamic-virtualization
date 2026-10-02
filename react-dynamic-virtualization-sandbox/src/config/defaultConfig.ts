import type { SandboxConfig } from "./types"

export const defaultConfig: SandboxConfig = {
  itemCount: 20,
  itemSizing: "variable",
  itemSize: 80,
  minItemSize: 40,
  maxItemSize: 160,
  overscan: 2,
  listHeight: 500,
  enableSizeChanges: true,
  changeInterval: 1_000,
}
