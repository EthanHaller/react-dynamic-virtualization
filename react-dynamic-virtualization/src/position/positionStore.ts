import { PositionTree } from "./positionTree"

const DEFAULT_ITEM_SIZE = 50

export type PositionSnapshot = {
  getPosition: (itemId: string) => number
  getIndexAtPosition: (position: number) => number
  getRenderRange: (
    scrollOffset: number,
    viewportSize: number,
    overscan: number,
  ) => { startIndex: number; endIndexExclusive: number }
  getTotalSize: () => number
}

export class PositionStore {
  private readonly itemSizes: Map<string, number>
  private positionTree: PositionTree
  private readonly listeners = new Set<() => void>()

  private snapshot: PositionSnapshot

  constructor(itemIds: string[], previousSizes?: Map<string, number>) {
    this.itemSizes = new Map(
      itemIds.map((itemId) => [
        itemId,
        previousSizes?.get(itemId) ?? DEFAULT_ITEM_SIZE,
      ]),
    )

    this.positionTree = new PositionTree(
      itemIds,
      itemIds.map((itemId) => this.itemSizes.get(itemId)!),
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

  private createSnapshot(): PositionSnapshot {
    return {
      getPosition: (itemId: string) => this.positionTree.getPosition(itemId),

      getIndexAtPosition: (position: number) =>
        this.positionTree.getIndexAtPosition(position),

      getRenderRange: (scrollOffset, viewportSize, overscan) => {
        const itemCount = this.itemSizes.size
        if (itemCount === 0 || viewportSize <= 0) {
          return { startIndex: 0, endIndexExclusive: 0 }
        }

        const firstVisibleIndex = this.positionTree.getIndexAtPosition(scrollOffset)
        const lastVisibleIndex = this.positionTree.getIndexAtPosition(
          scrollOffset + viewportSize - 1,
        )

        return {
          startIndex: Math.max(
            0,
            (firstVisibleIndex === -1 ? 0 : firstVisibleIndex) - overscan,
          ),
          endIndexExclusive: Math.min(
            itemCount,
            (lastVisibleIndex === -1 ? itemCount : lastVisibleIndex + 1) + overscan,
          ),
        }
      },

      getTotalSize: () => this.positionTree.getTotalSize(),
    }
  }
}
