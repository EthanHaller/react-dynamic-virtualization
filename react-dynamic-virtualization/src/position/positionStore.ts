import { PositionTree } from "./positionTree"

const DEFAULT_ITEM_HEIGHT = 50

export type PositionSnapshot = {
  getPosition: (itemId: string) => number
  getIndexAtPosition: (position: number) => number
  getTotalHeight: () => number
}

export class PositionStore {
  private readonly itemHeights: Map<string, number>
  private readonly positionTree: PositionTree
  private readonly listeners = new Set<() => void>()

  private snapshot: PositionSnapshot

  constructor(itemIds: string[]) {
    this.itemHeights = new Map(
      itemIds.map((itemId) => [itemId, DEFAULT_ITEM_HEIGHT]),
    )

    this.positionTree = new PositionTree(
      itemIds,
      itemIds.map(() => DEFAULT_ITEM_HEIGHT),
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

      getTotalHeight: () => this.positionTree.getTotalHeight(),
    }
  }
}
