import { PositionTree } from "./positionTree"

const DEFAULT_ITEM_HEIGHT = 50

export type PositionSnapshot = {
  getPosition: (itemId: string) => number
  getIndexAtPosition: (position: number) => number
  getRenderRange: (
    scrollTop: number,
    viewportHeight: number,
    overscan: number,
  ) => { startIndex: number; endIndexExclusive: number }
  getTotalHeight: () => number
}

export class PositionStore {
  private readonly itemHeights: Map<string, number>
  private positionTree: PositionTree
  private readonly listeners = new Set<() => void>()

  private snapshot: PositionSnapshot

  constructor(itemIds: string[], previousHeights?: Map<string, number>) {
    this.itemHeights = new Map(
      itemIds.map((itemId) => [
        itemId,
        previousHeights?.get(itemId) ?? DEFAULT_ITEM_HEIGHT,
      ]),
    )

    this.positionTree = new PositionTree(
      itemIds,
      itemIds.map((itemId) => this.itemHeights.get(itemId)!),
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

  getHeights = (): Map<string, number> => {
    return this.itemHeights
  }

  updateHeight(itemId: string, newHeight: number): void {
    const oldHeight = this.itemHeights.get(itemId)

    if (oldHeight === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    if (newHeight === oldHeight) {
      return
    }

    this.itemHeights.set(itemId, newHeight)
    this.positionTree.updateHeight(itemId, newHeight - oldHeight)
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

      getRenderRange: (scrollTop, viewportHeight, overscan) => {
        const itemCount = this.itemHeights.size
        if (itemCount === 0 || viewportHeight <= 0) {
          return { startIndex: 0, endIndexExclusive: 0 }
        }

        const firstVisibleIndex = this.positionTree.getIndexAtPosition(scrollTop)
        const lastVisibleIndex = this.positionTree.getIndexAtPosition(
          scrollTop + viewportHeight - 1,
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

      getTotalHeight: () => this.positionTree.getTotalHeight(),
    }
  }
}
