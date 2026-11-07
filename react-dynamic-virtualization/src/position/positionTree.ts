export class PositionTree {
  private readonly itemIds: string[]
  private readonly itemIndexById: Map<string, number>
  private readonly cumulativeSizes: number[]
  private totalSize: number

  constructor(itemIds: string[], sizes: number[]) {
    if (itemIds.length !== sizes.length) {
      throw new Error("itemIds and sizes must have the same length")
    }

    this.itemIds = [...itemIds]

    this.itemIndexById = new Map(
      this.itemIds.map((itemId, index) => [itemId, index]),
    )

    if (this.itemIndexById.size !== this.itemIds.length) {
      throw new Error("itemIds must be unique")
    }

    this.cumulativeSizes = new Array(this.itemIds.length + 1).fill(0)

    this.totalSize = 0

    for (let i = 0; i < this.itemIds.length; i++) {
      const size = sizes[i]

      this.cumulativeSizes[i + 1] = size
      this.totalSize += size
    }

    for (let i = 1; i < this.cumulativeSizes.length; i++) {
      const parentIndex = i + this.getCumulativeSizeStep(i)

      if (parentIndex < this.cumulativeSizes.length) {
        this.cumulativeSizes[parentIndex] += this.cumulativeSizes[i]
      }
    }
  }

  getPosition(itemId: string): number {
    const itemIndex = this.itemIndexById.get(itemId)

    if (itemIndex === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    return this.getSizeBeforeIndex(itemIndex)
  }

  getIndexAtPosition(position: number): number {
    if (
      position < 0 ||
      position >= this.totalSize ||
      this.itemIds.length === 0
    ) {
      return -1
    }

    let itemIndex = 0
    let sizeBeforeItem = 0
    let cumulativeSizeIndex = this.getLargestPowerOfTwo(this.itemIds.length)

    while (cumulativeSizeIndex > 0) {
      const candidateItemIndex = itemIndex + cumulativeSizeIndex

      if (
        candidateItemIndex <= this.itemIds.length &&
        sizeBeforeItem + this.cumulativeSizes[candidateItemIndex] <=
          position
      ) {
        itemIndex = candidateItemIndex
        sizeBeforeItem += this.cumulativeSizes[candidateItemIndex]
      }

      cumulativeSizeIndex = Math.floor(cumulativeSizeIndex / 2)
    }

    return itemIndex
  }

  getTotalSize(): number {
    return this.totalSize
  }

  updateSize(itemId: string, sizeDifference: number): void {
    const itemIndex = this.itemIndexById.get(itemId)

    if (itemIndex === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    if (sizeDifference === 0) {
      return
    }

    this.addSizeAtIndex(itemIndex, sizeDifference)
    this.totalSize += sizeDifference
  }

  private getSizeBeforeIndex(itemIndex: number): number {
    let size = 0
    let cumulativeSizeIndex = itemIndex

    while (cumulativeSizeIndex > 0) {
      size += this.cumulativeSizes[cumulativeSizeIndex]

      cumulativeSizeIndex -= this.getCumulativeSizeStep(
        cumulativeSizeIndex,
      )
    }

    return size
  }

  private addSizeAtIndex(itemIndex: number, sizeDifference: number): void {
    let cumulativeSizeIndex = itemIndex + 1

    while (cumulativeSizeIndex < this.cumulativeSizes.length) {
      this.cumulativeSizes[cumulativeSizeIndex] += sizeDifference

      cumulativeSizeIndex += this.getCumulativeSizeStep(
        cumulativeSizeIndex,
      )
    }
  }

  private getCumulativeSizeStep(index: number): number {
    let step = 1

    while (index % (step * 2) === 0) {
      step *= 2
    }

    return step
  }

  private getLargestPowerOfTwo(value: number): number {
    let powerOfTwo = 1

    while (powerOfTwo * 2 <= value) {
      powerOfTwo *= 2
    }

    return powerOfTwo
  }
}
