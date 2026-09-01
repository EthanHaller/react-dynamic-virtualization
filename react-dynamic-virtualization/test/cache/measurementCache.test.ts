import { afterEach, describe, expect, it } from "vitest"

import {
  clearMeasurementCache,
  deleteMeasuredHeight,
  getMeasuredHeight,
  setMeasuredHeight,
} from "../../src/cache/measurementCache"

describe("measurementCache", () => {
  afterEach(() => {
    clearMeasurementCache()
  })

  it("returns undefined for an item that has not been measured", () => {
    expect(getMeasuredHeight("item-1")).toBeUndefined()
  })

  it("stores and retrieves a measured height", () => {
    setMeasuredHeight("item-1", 100)

    expect(getMeasuredHeight("item-1")).toBe(100)
  })

  it("stores measurements independently for different items", () => {
    setMeasuredHeight("item-1", 100)
    setMeasuredHeight("item-2", 200)

    expect(getMeasuredHeight("item-1")).toBe(100)
    expect(getMeasuredHeight("item-2")).toBe(200)
  })

  it("updates an existing measurement", () => {
    setMeasuredHeight("item-1", 100)
    setMeasuredHeight("item-1", 150)

    expect(getMeasuredHeight("item-1")).toBe(150)
  })

  it("deletes a measurement", () => {
    setMeasuredHeight("item-1", 100)

    deleteMeasuredHeight("item-1")

    expect(getMeasuredHeight("item-1")).toBeUndefined()
  })

  it("clears all measurements", () => {
    setMeasuredHeight("item-1", 100)
    setMeasuredHeight("item-2", 200)

    clearMeasurementCache()

    expect(getMeasuredHeight("item-1")).toBeUndefined()
    expect(getMeasuredHeight("item-2")).toBeUndefined()
  })
})
