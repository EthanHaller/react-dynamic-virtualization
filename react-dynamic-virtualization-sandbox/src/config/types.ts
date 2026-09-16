export type ItemSizing = "fixed" | "variable"

export type SandboxConfig = {
  itemCount: number
  itemSizing: ItemSizing
  itemSize: number
  minItemSize: number
  maxItemSize: number
  overscan: number
  listHeight: number
}
