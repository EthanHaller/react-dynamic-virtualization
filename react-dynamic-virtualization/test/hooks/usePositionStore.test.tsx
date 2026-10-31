import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { usePositionStore } from "../../src/hooks/usePositionStore"

describe("usePositionStore", () => {
  it("initializes default heights and positions", () => {
    const { result } = renderHook(() => usePositionStore(["a", "b", "c"]))

    expect([...result.current.getHeights().entries()]).toEqual([
      ["a", 50],
      ["b", 50],
      ["c", 50],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("a")).toBe(0)
    expect(snapshot.getPosition("b")).toBe(50)
    expect(snapshot.getPosition("c")).toBe(100)
    expect(snapshot.getTotalHeight()).toBe(150)
  })

  it("builds positions when an initially empty list receives items", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: [] as string[] } },
    )
    const emptyStore = result.current
    expect(emptyStore.getSnapshot().getTotalHeight()).toBe(0)
    expect(emptyStore.getSnapshot().getIndexAtPosition(0)).toBe(-1)

    rerender({ itemIds: ["a", "b"] })

    expect(result.current).not.toBe(emptyStore)
    expect([...result.current.getHeights().entries()]).toEqual([
      ["a", 50],
      ["b", 50],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("a")).toBe(0)
    expect(snapshot.getPosition("b")).toBe(50)
    expect(snapshot.getTotalHeight()).toBe(100)
    expect(snapshot.getIndexAtPosition(50)).toBe(1)
  })

  it("retains measurements applied after rebuilding across subsequent rerenders", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b"] } },
    )
    const initialStore = result.current
    initialStore.updateHeight("a", 80)

    const reorderedIds = ["b", "c", "a"]
    rerender({ itemIds: reorderedIds })
    const rebuiltStore = result.current
    expect(rebuiltStore).not.toBe(initialStore)
    rebuiltStore.updateHeight("c", 120)

    rerender({ itemIds: reorderedIds })
    rerender({ itemIds: ["b", "c", "a"] })

    expect(result.current).toBe(rebuiltStore)
    expect([...result.current.getHeights().entries()]).toEqual([
      ["b", 50],
      ["c", 120],
      ["a", 80],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("b")).toBe(0)
    expect(snapshot.getPosition("c")).toBe(50)
    expect(snapshot.getPosition("a")).toBe(170)
    expect(snapshot.getTotalHeight()).toBe(250)
  })

  it("preserves the store and measured heights without reading unchanged IDs", () => {
    let indexedIdReads = 0
    let lengthReads = 0
    const itemIds = new Proxy(["a", "b", "c"], {
      get(target, property, receiver) {
        if (property === "length") lengthReads += 1
        if (typeof property === "string" && /^\d+$/.test(property)) {
          indexedIdReads += 1
        }
        return Reflect.get(target, property, receiver)
      },
    })
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds } },
    )
    const initialStore = result.current
    initialStore.updateHeight("a", 80)
    expect(indexedIdReads).toBeGreaterThan(0)
    indexedIdReads = 0
    lengthReads = 0

    rerender({ itemIds })
    rerender({ itemIds })

    expect(indexedIdReads).toBe(0)
    expect(lengthReads).toBe(0)
    expect(result.current).toBe(initialStore)
    expect(result.current.getHeights().get("a")).toBe(80)
    expect(result.current.getSnapshot().getPosition("b")).toBe(80)
    expect(result.current.getSnapshot().getTotalHeight()).toBe(180)
  })

  it("preserves the store and measured heights for a new array of equal IDs", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b", "c"] } },
    )
    const initialStore = result.current
    initialStore.updateHeight("b", 120)
    const measuredSnapshot = initialStore.getSnapshot()

    rerender({ itemIds: ["a", "b", "c"] })

    expect(result.current).toBe(initialStore)
    expect(result.current.getSnapshot()).toBe(measuredSnapshot)
    expect(result.current.getHeights().get("b")).toBe(120)
    expect(result.current.getSnapshot().getPosition("c")).toBe(170)
  })

  it.each([
    {
      change: "reordered",
      itemIds: ["c", "a", "b"],
      expectedHeights: [50, 80, 120],
      expectedPositions: [0, 50, 130],
      expectedTotalHeight: 250,
    },
    {
      change: "inserted",
      itemIds: ["a", "d", "b", "c"],
      expectedHeights: [80, 50, 120, 50],
      expectedPositions: [0, 80, 130, 250],
      expectedTotalHeight: 300,
    },
    {
      change: "removed",
      itemIds: ["a", "c"],
      expectedHeights: [80, 50],
      expectedPositions: [0, 80],
      expectedTotalHeight: 130,
    },
    {
      change: "replaced",
      itemIds: ["a", "d", "c"],
      expectedHeights: [80, 50, 50],
      expectedPositions: [0, 80, 130],
      expectedTotalHeight: 180,
    },
    {
      change: "all removed",
      itemIds: [],
      expectedHeights: [],
      expectedPositions: [],
      expectedTotalHeight: 0,
    },
  ])("rebuilds positions when IDs are $change, retaining heights by ID", ({
    itemIds,
    expectedHeights,
    expectedPositions,
    expectedTotalHeight,
  }) => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b", "c"] } },
    )
    const initialStore = result.current
    initialStore.updateHeight("a", 80)
    initialStore.updateHeight("b", 120)

    rerender({ itemIds })

    expect(result.current).not.toBe(initialStore)
    expect([...result.current.getHeights().keys()]).toEqual(itemIds)
    const snapshot = result.current.getSnapshot()
    itemIds.forEach((itemId, index) => {
      expect(result.current.getHeights().get(itemId)).toBe(expectedHeights[index])
      expect(snapshot.getPosition(itemId)).toBe(expectedPositions[index])
      expect(snapshot.getIndexAtPosition(expectedPositions[index])).toBe(index)
    })
    expect(snapshot.getTotalHeight()).toBe(expectedTotalHeight)
    expect(snapshot.getIndexAtPosition(expectedTotalHeight)).toBe(-1)
  })
})
