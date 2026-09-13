import { describe, expect, it } from 'vitest'
import { PositionTree } from "../../src/position/positionTree"

const itemIds = ['a', 'b', 'c', 'd']

const heights: Record<(typeof itemIds)[number], number> = {
  a: 10,
  b: 20,
  c: 30,
  d: 40,
}

const getHeight = (itemId: keyof typeof heights): number => {
  return heights[itemId]
}

const createTree = () => {
  return new PositionTree(itemIds, getHeight)
}

describe('PositionTree', () => {
  describe('getPosition', () => {
    it('returns the position of each item', () => {
      const tree = createTree()

      expect(tree.getPosition('a')).toBe(0)
      expect(tree.getPosition('b')).toBe(10)
      expect(tree.getPosition('c')).toBe(30)
      expect(tree.getPosition('d')).toBe(60)
    })

    it('throws for an unknown item', () => {
      const tree = createTree()

      expect(() => tree.getPosition('unknown')).toThrow(
        'Unknown itemId: unknown',
      )
    })
  })

  describe('getIndexAtPosition', () => {
    it('returns the index of the item at each position', () => {
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

    it('returns -1 for positions outside the list', () => {
      const tree = createTree()

      expect(tree.getIndexAtPosition(-1)).toBe(-1)
      expect(tree.getIndexAtPosition(100)).toBe(-1)
    })

    it('returns -1 for an empty list', () => {
      const tree = new PositionTree([], () => 0)

      expect(tree.getIndexAtPosition(0)).toBe(-1)
    })
  })

  describe('getTotalHeight', () => {
    it('returns the sum of all item heights', () => {
      const tree = createTree()

      expect(tree.getTotalHeight()).toBe(100)
    })

    it('returns zero for an empty list', () => {
      const tree = new PositionTree([], () => 0)

      expect(tree.getTotalHeight()).toBe(0)
    })
  })

  describe('updateHeight', () => {
    it('updates the positions of subsequent items', () => {
      const tree = createTree()

      tree.updateHeight('b', 15)

      expect(tree.getPosition('a')).toBe(0)
      expect(tree.getPosition('b')).toBe(10)
      expect(tree.getPosition('c')).toBe(45)
      expect(tree.getPosition('d')).toBe(75)
      expect(tree.getTotalHeight()).toBe(115)
    })

    it('does not update the positions of preceding items', () => {
      const tree = createTree()

      tree.updateHeight('c', 10)

      expect(tree.getPosition('a')).toBe(0)
      expect(tree.getPosition('b')).toBe(10)
      expect(tree.getPosition('c')).toBe(30)
    })

    it('handles decreasing an item height', () => {
      const tree = createTree()

      tree.updateHeight('b', -5)

      expect(tree.getPosition('c')).toBe(25)
      expect(tree.getPosition('d')).toBe(55)
      expect(tree.getTotalHeight()).toBe(95)
    })

    it('does nothing when the height difference is zero', () => {
      const tree = createTree()

      tree.updateHeight('b', 0)

      expect(tree.getPosition('c')).toBe(30)
      expect(tree.getTotalHeight()).toBe(100)
    })

    it('throws for an unknown item', () => {
      const tree = createTree()

      expect(() => tree.updateHeight('unknown', 10)).toThrow(
        'Unknown itemId: unknown',
      )
    })
  })

  describe('construction', () => {
    it('gets the height of every item', () => {
      const requestedItemIds: string[] = []

      const tree = new PositionTree(itemIds, (itemId) => {
        requestedItemIds.push(itemId)
        return heights[itemId as keyof typeof heights]
      })

      expect(requestedItemIds).toEqual(itemIds)
      expect(tree.getTotalHeight()).toBe(100)
    })
  })
})