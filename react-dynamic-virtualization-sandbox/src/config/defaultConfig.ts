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
  enableSizeChanges: true,
  changeInterval: 1_000,
}
