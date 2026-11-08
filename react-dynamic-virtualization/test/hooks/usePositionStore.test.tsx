import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { usePositionStore } from "../../src/hooks/usePositionStore"

describe("usePositionStore", () => {
  it("initializes default sizes and positions", () => {
    const { result } = renderHook(() => usePositionStore(["a", "b", "c"]))

    expect([...result.current.getSizes().entries()]).toEqual([
      ["a", 50],
      ["b", 50],
      ["c", 50],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("a")).toBe(0)
    expect(snapshot.getPosition("b")).toBe(50)
    expect(snapshot.getPosition("c")).toBe(100)
    expect(snapshot.getTotalSize()).toBe(150)
  })

  it("builds positions for items inserted into an empty list", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: [] as string[] } },
    )
    const emptyStore = result.current
    expect(emptyStore.getSnapshot().getTotalSize()).toBe(0)
    expect(emptyStore.getSnapshot().getIndexAtPosition(0)).toBe(-1)

    rerender({ itemIds: ["a", "b"] })

    expect(result.current).not.toBe(emptyStore)
    expect([...result.current.getSizes().entries()]).toEqual([
      ["a", 50],
      ["b", 50],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("a")).toBe(0)
    expect(snapshot.getPosition("b")).toBe(50)
    expect(snapshot.getTotalSize()).toBe(100)
    expect(snapshot.getIndexAtPosition(50)).toBe(1)
  })

  it("retains measurements across item changes and rerenders", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b"] } },
    )
    const initialStore = result.current
    initialStore.updateSize("a", 80)

    const reorderedIds = ["b", "c", "a"]
    rerender({ itemIds: reorderedIds })
    const rebuiltStore = result.current
    expect(rebuiltStore).not.toBe(initialStore)
    rebuiltStore.updateSize("c", 120)

    rerender({ itemIds: reorderedIds })
    rerender({ itemIds: ["b", "c", "a"] })

    expect(result.current).toBe(rebuiltStore)
    expect([...result.current.getSizes().entries()]).toEqual([
      ["b", 50],
      ["c", 120],
      ["a", 80],
    ])
    const snapshot = result.current.getSnapshot()
    expect(snapshot.getPosition("b")).toBe(0)
    expect(snapshot.getPosition("c")).toBe(50)
    expect(snapshot.getPosition("a")).toBe(170)
    expect(snapshot.getTotalSize()).toBe(250)
  })

  it("reuses the store and measurements by item ID array identity", () => {
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
    initialStore.updateSize("a", 80)
    expect(indexedIdReads).toBeGreaterThan(0)
    indexedIdReads = 0
    lengthReads = 0

    rerender({ itemIds })
    rerender({ itemIds })

    expect(indexedIdReads).toBe(0)
    expect(lengthReads).toBe(0)
    expect(result.current).toBe(initialStore)
    expect(result.current.getSizes().get("a")).toBe(80)
    expect(result.current.getSnapshot().getPosition("b")).toBe(80)
    expect(result.current.getSnapshot().getTotalSize()).toBe(180)
  })

  it("reuses the store and measurements for equal item ID sequences", () => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b", "c"] } },
    )
    const initialStore = result.current
    initialStore.updateSize("b", 120)
    const measuredSnapshot = initialStore.getSnapshot()

    rerender({ itemIds: ["a", "b", "c"] })

    expect(result.current).toBe(initialStore)
    expect(result.current.getSnapshot()).toBe(measuredSnapshot)
    expect(result.current.getSizes().get("b")).toBe(120)
    expect(result.current.getSnapshot().getPosition("c")).toBe(170)
  })

  it.each([
    {
      change: "reordered",
      itemIds: ["c", "a", "b"],
      expectedSizes: [50, 80, 120],
      expectedPositions: [0, 50, 130],
      expectedTotalSize: 250,
    },
    {
      change: "inserted",
      itemIds: ["a", "d", "b", "c"],
      expectedSizes: [80, 50, 120, 50],
      expectedPositions: [0, 80, 130, 250],
      expectedTotalSize: 300,
    },
    {
      change: "removed",
      itemIds: ["a", "c"],
      expectedSizes: [80, 50],
      expectedPositions: [0, 80],
      expectedTotalSize: 130,
    },
    {
      change: "replaced",
      itemIds: ["a", "d", "c"],
      expectedSizes: [80, 50, 50],
      expectedPositions: [0, 80, 130],
      expectedTotalSize: 180,
    },
    {
      change: "all removed",
      itemIds: [],
      expectedSizes: [],
      expectedPositions: [],
      expectedTotalSize: 0,
    },
  ])("rebuilds positions and retains sizes by ID when items are $change", ({
    itemIds,
    expectedSizes,
    expectedPositions,
    expectedTotalSize,
  }) => {
    const { result, rerender } = renderHook(
      ({ itemIds }) => usePositionStore(itemIds),
      { initialProps: { itemIds: ["a", "b", "c"] } },
    )
    const initialStore = result.current
    initialStore.updateSize("a", 80)
    initialStore.updateSize("b", 120)

    rerender({ itemIds })

    expect(result.current).not.toBe(initialStore)
    expect([...result.current.getSizes().keys()]).toEqual(itemIds)
    const snapshot = result.current.getSnapshot()
    itemIds.forEach((itemId, index) => {
      expect(result.current.getSizes().get(itemId)).toBe(expectedSizes[index])
      expect(snapshot.getPosition(itemId)).toBe(expectedPositions[index])
      expect(snapshot.getIndexAtPosition(expectedPositions[index])).toBe(index)
    })
    expect(snapshot.getTotalSize()).toBe(expectedTotalSize)
    expect(snapshot.getIndexAtPosition(expectedTotalSize)).toBe(-1)
  })
})
