import { act, fireEvent, render, screen } from "@testing-library/react"
import { createRef } from "react"
import { beforeEach, describe, expect, it } from "vitest"

import { VirtualizedList } from "../../src/components/VirtualizedList"
import type { RenderItemOptions } from "../../src/components/VirtualizedListItem"
import { MockResizeObserver } from "../mocks/resizeObserver"

const items = ["a", "b", "c", "d"]
const getItemId = (item: string) => item

function renderItem(item: string, { ref, style }: RenderItemOptions) {
  return <div ref={ref} style={style}>{item}</div>
}

function measureItem(item: string, width: number, height: number) {
  const observers = MockResizeObserver.instances
  const observer = observers[observers.length - 1]
  const entry: ResizeObserverEntry = {
    target: screen.getByText(item),
    contentRect: new DOMRect(0, 0, width, height),
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  }
  act(() => observer.callback([entry], observer))
}

describe("VirtualizedList orientation", () => {
  beforeEach(() => MockResizeObserver.reset())

  it("uses the viewport width and measured item widths for horizontal layout", () => {
    const viewportRef = createRef<HTMLDivElement>()
    const list = (width: number) => (
      <VirtualizedList
        orientation="horizontal"
        width={width}
        items={items}
        getItemId={getItemId}
        overscan={0}
        renderItem={renderItem}
        scrollElementRef={viewportRef}
      />
    )
    const { rerender } = render(list(99))
    const viewport = viewportRef.current!

    expect(MockResizeObserver.instances).toHaveLength(1)
    expect(viewport.textContent).toBe("ab")
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(50px)" })

    measureItem("a", 80, 200)
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(80px)" })
    expect(screen.getByText("b").parentElement).toHaveStyle({ width: "230px", height: "100%" })

    rerender(list(160))
    expect(viewport.textContent).toBe("abc")
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(80px)" })

    rerender(list(100))
    viewport.scrollLeft = 130
    fireEvent.scroll(viewport)
    expect(viewport.textContent).toBe("cd")
  })

  it("resets scroll offset and item sizes on orientation changes", () => {
    const viewportRef = createRef<HTMLDivElement>()
    const props = { items, getItemId, renderItem, overscan: 0, scrollElementRef: viewportRef }
    const { rerender } = render(<VirtualizedList {...props} height={100} />)
    const verticalViewport = viewportRef.current!

    measureItem("a", 200, 80)
    verticalViewport.scrollTop = 130
    fireEvent.scroll(verticalViewport)
    expect(verticalViewport.textContent).toBe("cd")

    rerender(<VirtualizedList {...props} orientation="horizontal" width={99} height={100} />)
    const horizontalViewport = viewportRef.current!

    expect(horizontalViewport).not.toBe(verticalViewport)
    expect(horizontalViewport.scrollLeft).toBe(0)
    expect(horizontalViewport.textContent).toBe("ab")
    expect(screen.getByText("b")).toHaveStyle({ transform: "translateX(50px)" })
  })
})
