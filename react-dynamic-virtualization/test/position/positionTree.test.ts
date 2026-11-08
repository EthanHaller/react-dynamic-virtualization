import { describe, expect, it } from "vitest"

import { PositionTree } from "../../src/position/positionTree"

const itemIds = ["a", "b", "c", "d"]

const sizes = [10, 20, 30, 40]

const createTree = () => {
  return new PositionTree(itemIds, sizes)
}

describe("PositionTree", () => {
  describe("getPosition", () => {
    it("returns the position of each item", () => {
      const tree = createTree()

      expect(tree.getPosition("a")).toBe(0)
      expect(tree.getPosition("b")).toBe(10)
      expect(tree.getPosition("c")).toBe(30)
      expect(tree.getPosition("d")).toBe(60)
    })

    it("throws for an unknown item", () => {
      const tree = createTree()

      expect(() => tree.getPosition("unknown")).toThrow(
        "Unknown itemId: unknown",
      )
    })
  })

  describe("getIndexAtPosition", () => {
    it("returns the index of the item at each position", () => {
      const tree = createTree()

      expect(tree.getIndexAtPosition(0)).toBe(0)
      expect(tree.getIndexAtPosition(9)).toBe(0)
      expect(tree.getIndexAtPosition(10)).toBe(1)
      expect(tree.getIndexAtPosition(29)).toBe(1)
      expect(tree.getIndexAtPosition(30)).toBe(2)
      expect(tree.getIndexAtPosition(59)).toBe(2)
      expect(tree.getIndexAtPosition(60)).toBe(3)
      expect(tree.getIndexAtPosition(99)).toBe(3)
    })

    it("returns -1 for positions outside the list", () => {
      const tree = createTree()

      expect(tree.getIndexAtPosition(-1)).toBe(-1)
      expect(tree.getIndexAtPosition(100)).toBe(-1)
    })

    it("returns -1 for an empty list", () => {
      const tree = new PositionTree([], [])

      expect(tree.getIndexAtPosition(0)).toBe(-1)
    })
  })

  describe("getTotalSize", () => {
    it("returns the sum of all item sizes", () => {
      const tree = createTree()

      expect(tree.getTotalSize()).toBe(100)
    })

    it("returns zero for an empty list", () => {
      const tree = new PositionTree([], [])

      expect(tree.getTotalSize()).toBe(0)
    })
  })

  describe("updateSize", () => {
    it("updates the positions of subsequent items", () => {
      const tree = createTree()

      tree.updateSize("b", 15)

      expect(tree.getPosition("a")).toBe(0)
      expect(tree.getPosition("b")).toBe(10)
      expect(tree.getPosition("c")).toBe(45)
      expect(tree.getPosition("d")).toBe(75)
      expect(tree.getTotalSize()).toBe(115)
    })

    it("preserves preceding item positions when an item resizes", () => {
      const tree = createTree()

      tree.updateSize("c", 10)

      expect(tree.getPosition("a")).toBe(0)
      expect(tree.getPosition("b")).toBe(10)
      expect(tree.getPosition("c")).toBe(30)
    })

    it("handles decreasing an item size", () => {
      const tree = createTree()

      tree.updateSize("b", -5)

      expect(tree.getPosition("c")).toBe(25)
      expect(tree.getPosition("d")).toBe(55)
      expect(tree.getTotalSize()).toBe(95)
    })

    it("preserves positions and total size for a zero size difference", () => {
      const tree = createTree()

      tree.updateSize("b", 0)

      expect(tree.getPosition("c")).toBe(30)
      expect(tree.getTotalSize()).toBe(100)
    })

    it("throws for an unknown item", () => {
      const tree = createTree()

      expect(() => tree.updateSize("unknown", 10)).toThrow(
        "Unknown itemId: unknown",
      )
    })
  })

  describe("construction", () => {
    it("throws when itemIds and sizes have different lengths", () => {
      expect(() => new PositionTree(["a", "b"], [10])).toThrow(
        "itemIds and sizes must have the same length",
      )
    })

    it("rejects duplicate item IDs", () => {
      expect(() => new PositionTree(["a", "a"], [10, 20])).toThrow(
        "itemIds must be unique",
      )
    })
  })
})
