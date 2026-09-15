import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import {
  clearMeasurementCache,
  getMeasuredHeight,
} from "../../src/cache/measurementCache"
import { VirtualizedList } from "../../src/components/VirtualizedList"
import { MockResizeObserver } from "../mocks/resizeObserver"

type Item = {
  id: string
  name: string
}

function createResizeObserverEntry(
  element: HTMLElement,
  height: number,
): ResizeObserverEntry {
  return {
    target: element,
    contentRect: new DOMRect(0, 0, 0, height),
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  }
}

function triggerResize(element: HTMLElement, height: number): void {
  const observer = MockResizeObserver.instances[0]

  if (observer === undefined) {
    throw new Error("No ResizeObserver was created")
  }

  act(() => {
    observer.callback([createResizeObserverEntry(element, height)], observer)
  })
}

function renderList(items: Item[]) {
  return render(
    <VirtualizedList
      items={items}
      getItemId={(item) => item.id}
      height={500}
      renderItem={(item, { ref, style }) => (
        <div key={item.id} ref={ref} style={style} data-testid={item.id}>
          {item.name}
        </div>
      )}
    />,
  )
}

describe("VirtualizedList integration", () => {
  beforeEach(() => {
    clearMeasurementCache()
    MockResizeObserver.reset()
  })

  it("updates item positions when an item's height changes", () => {
    const items: Item[] = [
      { id: "item-1", name: "Item 1" },
      { id: "item-2", name: "Item 2" },
      { id: "item-3", name: "Item 3" },
    ]

    renderList(items)

    const item1 = screen.getByTestId("item-1")
    const item2 = screen.getByTestId("item-2")
    const item3 = screen.getByTestId("item-3")

    expect(item1).toHaveStyle({
      transform: "translateY(0px)",
    })
    expect(item2).toHaveStyle({
      transform: "translateY(50px)",
    })
    expect(item3).toHaveStyle({
      transform: "translateY(100px)",
    })

    const sentinel = item1.parentElement

    expect(sentinel).not.toBeNull()
    expect(sentinel).toHaveStyle({
      height: "150px",
    })

    triggerResize(item1, 100)

    expect(getMeasuredHeight("item-1")).toBe(100)

    expect(item1).toHaveStyle({
      transform: "translateY(0px)",
    })
    expect(item2).toHaveStyle({
      transform: "translateY(100px)",
    })
    expect(item3).toHaveStyle({
      transform: "translateY(150px)",
    })
    expect(sentinel).toHaveStyle({
      height: "200px",
    })
  })

  it("observes each rendered item with the same ResizeObserver", () => {
    const items: Item[] = [
      { id: "item-1", name: "Item 1" },
      { id: "item-2", name: "Item 2" },
      { id: "item-3", name: "Item 3" },
    ]

    renderList(items)

    expect(MockResizeObserver.instances).toHaveLength(1)

    const observer = MockResizeObserver.instances[0]

    expect(observer.observe).toHaveBeenCalledTimes(3)
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId("item-1"))
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId("item-2"))
    expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId("item-3"))
  })

  it("does not update positions when the measured height is unchanged", () => {
    const items: Item[] = [
      { id: "item-1", name: "Item 1" },
      { id: "item-2", name: "Item 2" },
    ]

    renderList(items)

    const item1 = screen.getByTestId("item-1")
    const item2 = screen.getByTestId("item-2")

    triggerResize(item1, 75)

    expect(item2).toHaveStyle({
      transform: "translateY(75px)",
    })

    triggerResize(item1, 75)

    expect(item2).toHaveStyle({
      transform: "translateY(75px)",
    })
    expect(getMeasuredHeight("item-1")).toBe(75)
  })
})
