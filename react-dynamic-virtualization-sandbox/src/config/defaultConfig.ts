import type { SandboxConfig } from "./types"

export const defaultConfig: SandboxConfig = {
  itemCount: 20,
  itemSize: 80,
  overscan: 2,
  listHeight: 500,
  enableSizeChanges: true,
  changeInterval: 1_000,
}
