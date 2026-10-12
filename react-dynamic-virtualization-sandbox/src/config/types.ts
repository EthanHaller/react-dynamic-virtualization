export type SandboxConfig = {
  itemCount: number
  itemSize: number
  overscan: number
  listHeight: number
  enableSizeChanges: boolean
  changeInterval: number
}

export type ListConfig = Pick<SandboxConfig, "itemCount" | "overscan" | "listHeight">
export type InitialHeightsConfig = ListConfig & Pick<SandboxConfig, "itemSize">
export type ChangingHeightsConfig = ListConfig & Pick<SandboxConfig, "enableSizeChanges" | "changeInterval">
