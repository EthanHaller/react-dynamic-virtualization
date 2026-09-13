export class PositionTree {
  private readonly itemIds: string[]
  private readonly itemIndexById: Map<string, number>
  private readonly cumulativeHeights: number[]
  private totalHeight: number

  constructor(itemIds: string[], getHeight: (itemId: string) => number) {
    this.itemIds = [...itemIds]

    this.itemIndexById = new Map(
      this.itemIds.map((itemId, index) => [itemId, index]),
    )

    if (this.itemIndexById.size !== this.itemIds.length) {
      throw new Error("itemIds must be unique")
    }

    this.cumulativeHeights = new Array(this.itemIds.length + 1).fill(0)

    this.totalHeight = 0

    for (let i = 0; i < this.itemIds.length; i++) {
      const height = getHeight(this.itemIds[i])

      this.cumulativeHeights[i + 1] = height
      this.totalHeight += height
    }

    for (let i = 1; i < this.cumulativeHeights.length; i++) {
      const parentIndex = i + this.getCumulativeHeightStep(i)

      if (parentIndex < this.cumulativeHeights.length) {
        this.cumulativeHeights[parentIndex] += this.cumulativeHeights[i]
      }
    }
  }

  getPosition(itemId: string): number {
    const itemIndex = this.itemIndexById.get(itemId)

    if (itemIndex === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    return this.getHeightBeforeIndex(itemIndex)
  }

  getIndexAtPosition(position: number): number {
    if (
      position < 0 ||
      position >= this.totalHeight ||
      this.itemIds.length === 0
    ) {
      return -1
    }

    let itemIndex = 0
    let heightBeforeItem = 0
    let cumulativeHeightIndex = this.getLargestPowerOfTwo(this.itemIds.length)

    while (cumulativeHeightIndex > 0) {
      const candidateItemIndex = itemIndex + cumulativeHeightIndex

      if (
        candidateItemIndex <= this.itemIds.length &&
        heightBeforeItem + this.cumulativeHeights[candidateItemIndex] <=
          position
      ) {
        itemIndex = candidateItemIndex
        heightBeforeItem += this.cumulativeHeights[candidateItemIndex]
      }

      cumulativeHeightIndex = Math.floor(cumulativeHeightIndex / 2)
    }

    return itemIndex
  }

  getTotalHeight(): number {
    return this.totalHeight
  }

  updateHeight(itemId: string, heightDifference: number): void {
    const itemIndex = this.itemIndexById.get(itemId)

    if (itemIndex === undefined) {
      throw new Error(`Unknown itemId: ${itemId}`)
    }

    if (heightDifference === 0) {
      return
    }

    this.addHeightAtIndex(itemIndex, heightDifference)
    this.totalHeight += heightDifference
  }

  private getHeightBeforeIndex(itemIndex: number): number {
    let height = 0
    let cumulativeHeightIndex = itemIndex

    while (cumulativeHeightIndex > 0) {
      height += this.cumulativeHeights[cumulativeHeightIndex]

      cumulativeHeightIndex -= this.getCumulativeHeightStep(
        cumulativeHeightIndex,
      )
    }

    return height
  }

  private addHeightAtIndex(itemIndex: number, heightDifference: number): void {
    let cumulativeHeightIndex = itemIndex + 1

    while (cumulativeHeightIndex < this.cumulativeHeights.length) {
      this.cumulativeHeights[cumulativeHeightIndex] += heightDifference

      cumulativeHeightIndex += this.getCumulativeHeightStep(
        cumulativeHeightIndex,
      )
    }
  }

  private getCumulativeHeightStep(index: number): number {
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
