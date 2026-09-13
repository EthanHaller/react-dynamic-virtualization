import { PositionTree } from "./positionTree"

export class PositionStore {
  private readonly positionTree: PositionTree
  private readonly listeners = new Set<() => void>()
  private version = 0

  constructor(itemIds: string[], getHeight: (itemId: string) => number) {
    this.positionTree = new PositionTree(itemIds, getHeight)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot(): number {
    return this.version
  }

  updateHeight(itemId: string, heightDifference: number): void {
    if (heightDifference === 0) {
      return
    }

    this.positionTree.updateHeight(itemId, heightDifference)
    this.version++

    for (const listener of this.listeners) {
      listener()
    }
  }

  getPosition(itemId: string): number {
    return this.positionTree.getPosition(itemId)
  }

  getIndexAtPosition(position: number): number {
    return this.positionTree.getIndexAtPosition(position)
  }

  getTotalHeight(): number {
    return this.positionTree.getTotalHeight()
  }
}
