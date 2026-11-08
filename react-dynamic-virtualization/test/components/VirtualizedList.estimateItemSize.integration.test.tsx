import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VirtualizedList } from "../../src/components/VirtualizedList"
import type { RenderItemOptions } from "../../src/components/VirtualizedListItem"
import { MockResizeObserver } from "../mocks/resizeObserver"

const items = [
  { id: "a", size: 80 },
  { id: "b", size: 40 },
  { id: "c", size: 60 },
]
type Item = (typeof items)[number]

const getItemId = (item: Item) => item.id
const estimateItemSize = (item: Item) => item.size

function renderItem(item: Item, { ref, style }: RenderItemOptions) {
  return <div ref={ref} style={style}>{item.id}</div>
}

function measureHeight(itemId: string, height: number) {
  const observer = MockResizeObserver.instances[0]
  act(() => {
    observer.callback([{
      target: screen.getByText(itemId),
      contentRect: new DOMRect(0, 0, 0, height),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    }], observer)
  })
}

describe("VirtualizedList item size estimates", () => {
  beforeEach(() => MockResizeObserver.reset())

  it("positions horizontal items using their estimated widths", () => {
    render(
      <VirtualizedList
        orientation="horizontal"
        width={300}
        items={items}
        getItemId={getItemId}
        estimateItemSize={estimateItemSize}
        renderItem={renderItem}
      />,
    )

    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(80px)" })
    expect(screen.getByText("c")).toHaveStyle({ transform: "translateX(120px)" })
  })

  it("uses measured heights for item positions as items resize", () => {
    render(
      <VirtualizedList
        height={300}
        items={items}
        getItemId={getItemId}
        estimateItemSize={estimateItemSize}
        renderItem={renderItem}
      />,
    )

    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(80px)" })

    measureHeight("a", 100)
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(100px)" })

    measureHeight("a", 65)
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(65px)" })
  })

  it("preserves item positions and row renders across estimator changes", () => {
    const renderRow = vi.fn(renderItem)
    const list = (estimate: (item: Item) => number) => (
      <VirtualizedList
        height={300}
        items={items}
        getItemId={getItemId}
        estimateItemSize={estimate}
        renderItem={renderRow}
      />
    )
    const { rerender } = render(list(estimateItemSize))
    const replacementEstimate = vi.fn(() => 150)
    renderRow.mockClear()

    rerender(list(replacementEstimate))

    expect(replacementEstimate).toHaveBeenCalledTimes(0)
    expect(renderRow).toHaveBeenCalledTimes(0)
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(80px)" })
  })

  it("estimates inserted items while retaining sizes for existing IDs", () => {
    const list = (listItems: Item[], estimate: (item: Item) => number, gap = 0) => (
      <VirtualizedList
        height={300}
        items={listItems}
        getItemId={getItemId}
        estimateItemSize={estimate}
        renderItem={renderItem}
        gap={gap}
      />
    )
    const { rerender } = render(list(items.slice(0, 2), estimateItemSize))
    measureHeight("a", 65)

    const estimate = vi.fn((item: Item) => item.size + 10)
    rerender(list([items[2], items[0], items[1]], estimate, 10))

    expect(estimate).toHaveBeenCalledExactlyOnceWith(items[2])
    expect(screen.getByText("a")).toHaveStyle({ transform: "translateY(80px)" })
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(155px)" })
    expect(screen.getByText("b").parentElement).toHaveStyle({ height: "195px" })
  })
})
