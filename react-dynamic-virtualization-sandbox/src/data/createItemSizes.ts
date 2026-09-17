import type { ItemSizing } from "../config/types"

type CreateItemSizesOptions = {
  count: number
  sizing: ItemSizing
  fixedSize: number
  minSize: number
  maxSize: number
}

export function createItemSizes({
  count,
  sizing,
  fixedSize,
  minSize,
  maxSize,
}: CreateItemSizesOptions): number[] {
  if (sizing === "fixed") {
    return Array(count).fill(fixedSize)
  }

  return Array.from({ length: count }, (_, index) => {
    const normalizedIndex = (index * 47) % 101
    const ratio = normalizedIndex / 100

    return Math.round(minSize + ratio * (maxSize - minSize))
  })
}
