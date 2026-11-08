import { PositionTree } from "./positionTree"

const DEFAULT_ITEM_SIZE = 50

type ListPadding = {
  paddingStart: number
  paddingEnd: number
}

const NO_PADDING: ListPadding = { paddingStart: 0, paddingEnd: 0 }

export type PositionStoreOptions = {
  gap?: number
  estimateItemSizeAtIndex?: (index: number) => number
}

export type PositionSnapshot = {
  getPosition: (itemId: string, padding?: ListPadding) => number
  getIndexAtPosition: (position: number) => number
  getRenderRange: (
    scrollOffset: number,
    viewportSize: number,
    overscan: number,
    padding?: ListPadding,
  ) => { startIndex: number; endIndex: number }
  getTotalSize: (padding?: ListPadding) => number
}

export class PositionStore {
  // Keeping gap separate from itemSizes lets cached measurements survive gap changes.
  readonly gap: number
  private readonly itemSizes: Map<string, number>
  private positionTree: PositionTree
  private readonly listeners = new Set<() => void>()

  private snapshot: PositionSnapshot

  constructor(
    itemIds: string[],
    previousSizes?: Map<string, number>,
    { gap = 0, estimateItemSizeAtIndex }: PositionStoreOptions = {},
  ) {
    this.gap = gap
    this.itemSizes = new Map(
      itemIds.map((itemId, index) => {
        const previousSize = previousSizes?.get(itemId)
        if (previousSize !== undefined) {
          return [itemId, previousSize]
        }

        if (estimateItemSizeAtIndex === undefined) {
          return [itemId, DEFAULT_ITEM_SIZE]
        }

        const estimate = estimateItemSizeAtIndex(index)
        if (!Number.isFinite(estimate) || estimate <= 0) {
          throw new Error(`estimateItemSize must return a finite, positive number for item "${itemId}"`)
        }

        return [itemId, estimate]
      }),
    )

    this.positionTree = new PositionTree(
      itemIds,
      itemIds.map((itemId, index) => {
        const itemSize = this.itemSizes.get(itemId)!
        return index === itemIds.length - 1 ? itemSize : itemSize + gap
      }),
    )

    this.snapshot = this.createSnapshot()
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): PositionSnapshot => {
    return this.snapshot
  }

  getSizes = (): Map<string, number> => {
    return this.itemSizes
  }

  updateSize(itemId: string, newSize: number): void {
    const oldSize = this.itemSizes.get(itemId)

    if (oldSize === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    if (newSize === oldSize) {
      return
    }

    this.itemSizes.set(itemId, newSize)
    this.positionTree.updateSize(itemId, newSize - oldSize)
    this.snapshot = this.createSnapshot()

    for (const listener of this.listeners) {
      listener()
    }
  }

  private getRenderRange(
    scrollOffset: number,
    viewportSize: number,
    overscan: number,
    { paddingStart, paddingEnd }: ListPadding,
  ) {
    const itemCount = this.itemSizes.size
    if (itemCount === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: 0 }
    }

    const hasGapOrPadding = this.gap !== 0 || paddingStart !== 0 || paddingEnd !== 0
    const { startIndex, endIndex } = hasGapOrPadding
      ? this.getRangeWithSpacing(scrollOffset, viewportSize, paddingStart)
      : this.getRangeWithoutSpacing(scrollOffset, viewportSize)

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(itemCount, endIndex + overscan),
    }
  }

  private getRangeWithoutSpacing(scrollOffset: number, viewportSize: number) {
    const firstItemIndex = this.positionTree.getIndexAtPosition(scrollOffset)
    const lastItemIndex = this.positionTree.getIndexAtPosition(
      scrollOffset + viewportSize,
    )

    return {
      startIndex: firstItemIndex === -1 ? 0 : firstItemIndex,
      endIndex: lastItemIndex === -1 ? this.itemSizes.size : lastItemIndex + 1,
    }
  }

  private getRangeWithSpacing(scrollOffset: number, viewportSize: number, paddingStart: number) {
    // Tree offsets are relative to the first item because padding is stored separately.
    const startOffsetFromFirstItem = scrollOffset - paddingStart
    const endOffsetFromFirstItem = startOffsetFromFirstItem + viewportSize
    const firstItemIndex = this.positionTree.getIndexAtPosition(
      Math.max(0, startOffsetFromFirstItem),
    )
    const startIndex = firstItemIndex === -1 ? this.itemSizes.size : firstItemIndex

    if (endOffsetFromFirstItem <= 0) {
      return { startIndex, endIndex: 0 }
    }

    const lastItemIndex = this.positionTree.getIndexAtPosition(endOffsetFromFirstItem)
    return {
      startIndex,
      endIndex: lastItemIndex === -1 ? this.itemSizes.size : lastItemIndex + 1,
    }
  }

  private createSnapshot(): PositionSnapshot {
    return {
      getPosition: (itemId, { paddingStart } = NO_PADDING) =>
        paddingStart + this.positionTree.getPosition(itemId),

      getIndexAtPosition: (position: number) =>
        this.positionTree.getIndexAtPosition(position),

      getRenderRange: (scrollOffset, viewportSize, overscan, padding = NO_PADDING) =>
        this.getRenderRange(scrollOffset, viewportSize, overscan, padding),

      getTotalSize: ({ paddingStart, paddingEnd } = NO_PADDING) =>
        this.positionTree.getTotalSize() + paddingStart + paddingEnd,
    }
  }
}
