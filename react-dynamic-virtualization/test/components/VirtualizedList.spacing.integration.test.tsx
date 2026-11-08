import { act, fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { beforeEach, describe, expect, it } from "vitest"

import { VirtualizedList } from "../../src/components/VirtualizedList"
import type { RenderItemOptions } from "../../src/components/VirtualizedListItem"
import { MockResizeObserver } from "../mocks/resizeObserver"

const items = ["a", "b", "c"]
const getItemId = (item: string) => item

function renderItem(item: string, { ref, style }: RenderItemOptions) {
  return <div ref={ref} style={style}>{item}</div>
}

describe("VirtualizedList spacing", () => {
  beforeEach(() => MockResizeObserver.reset())

  it("renders items bordering a gap at viewport edges", () => {
    const viewportRef = createRef<HTMLDivElement>()
    render(
      <VirtualizedList
        height={10}
        items={items}
        getItemId={getItemId}
        overscan={0}
        gap={20}
        paddingStart={10}
        paddingEnd={20}
        renderItem={renderItem}
        scrollElementRef={viewportRef}
      />,
    )

    const viewport = viewportRef.current!
    expect(viewport.textContent).toBe("")

    viewport.scrollTop = 60
    fireEvent.scroll(viewport)
    expect(viewport.textContent).toBe("a")

    viewport.scrollTop = 70
    fireEvent.scroll(viewport)
    expect(viewport.textContent).toBe("ab")

    viewport.scrollTop = 70.5
    fireEvent.scroll(viewport)
    expect(viewport.textContent).toBe("ab")
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateY(80px)" })
  })

  it.each([0, 10])("renders a partially visible item with %i pixels of end padding", (paddingEnd) => {
    render(
      <VirtualizedList
        height={50.5}
        items={items}
        getItemId={getItemId}
        overscan={0}
        paddingEnd={paddingEnd}
        renderItem={renderItem}
      />,
    )

    expect(screen.getByText("b")).toBeInTheDocument()
    expect(screen.queryByText("c")).not.toBeInTheDocument()
  })

  it("preserves measured item widths across gap changes", () => {
    const viewportRef = createRef<HTMLDivElement>()
    const list = (gap: number) => (
      <VirtualizedList
        orientation="horizontal"
        width={300}
        items={items}
        getItemId={getItemId}
        gap={gap}
        paddingStart={12}
        paddingEnd={8}
        renderItem={renderItem}
        scrollElementRef={viewportRef}
      />
    )
    const { rerender } = render(list(10))
    const first = screen.getByText("a")
    const observer = MockResizeObserver.instances[0]
    act(() => observer.callback([{
      target: first,
      contentRect: new DOMRect(0, 0, 75, 50),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    }], observer))

    rerender(list(20))

    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(107px)" })
    expect(first.parentElement).toHaveStyle({ width: "235px" })
    expect(MockResizeObserver.instances).toHaveLength(1)
  })

  it.each([
    { label: "no items", items: [], totalSize: 20 },
    { label: "one item", items: ["a"], totalSize: 70 },
  ])("applies the viewport class and padding with $label", ({ items, totalSize }) => {
    const viewportRef = createRef<HTMLDivElement>()
    render(
      <VirtualizedList
        items={items}
        getItemId={getItemId}
        height={100}
        gap={20}
        paddingStart={12}
        paddingEnd={8}
        className="example-viewport"
        renderItem={renderItem}
        scrollElementRef={viewportRef}
      />,
    )

    expect(viewportRef.current).toHaveClass("example-viewport")
    expect(viewportRef.current?.firstElementChild).toHaveStyle({ height: `${totalSize}px` })
  })
})
