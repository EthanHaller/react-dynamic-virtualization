import { act, fireEvent, render } from "@testing-library/react"
import { createRef, Profiler } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { VirtualizedList } from "../../src/components/VirtualizedList"
import { MockResizeObserver } from "../mocks/resizeObserver"

function renderResponsiveList() {
  const items = ["a", "b", "c", "d"]
  const viewportRef = createRef<HTMLDivElement>()
  const onRender = vi.fn()
  const list = (height: string | number) => (
    <Profiler id="list" onRender={onRender}>
      <VirtualizedList
        items={items}
        getItemId={(item) => item}
        height={height}
        overscan={0}
        scrollElementRef={viewportRef}
        renderItem={(item, { ref, style }) => (
          <div ref={ref} style={style}>{item}</div>
        )}
      />
    </Profiler>
  )

  const { rerender, unmount } = render(list("70dvh"))
  const viewport = viewportRef.current!
  const viewportObserver = MockResizeObserver.instances[0]
  let clientHeight = 0
  Object.defineProperty(viewport, "clientHeight", { get: () => clientHeight })

  return {
    viewport,
    viewportObserver,
    onRender,
    unmount,
    setHeight: (height: string | number) => rerender(list(height)),
    setClientHeight: (height: number) => {
      clientHeight = height
    },
    notifyViewportResize: () =>
      act(() => viewportObserver.callback([], viewportObserver)),
  }
}

describe("CSS-sized viewport", () => {
  beforeEach(() => {
    MockResizeObserver.reset()
  })

  it("uses the measured height and current scroll offset to render rows", () => {
    const { viewport, setClientHeight, notifyViewportResize } = renderResponsiveList()
    expect(viewport.style.height).toBe("70dvh")
    expect(viewport.textContent).toBe("")

    setClientHeight(49)
    notifyViewportResize()
    expect(viewport.textContent).toBe("a")

    viewport.scrollTop = 150
    fireEvent.scroll(viewport)
    expect(viewport.textContent).toBe("d")

    viewport.scrollTop = 100
    setClientHeight(100)
    notifyViewportResize()
    expect(viewport.textContent).toBe("cd")

    setClientHeight(0)
    notifyViewportResize()
    expect(viewport.textContent).toBe("")
  })

  it("preserves the current render for repeated viewport measurements", () => {
    const { onRender, setClientHeight, notifyViewportResize } = renderResponsiveList()
    setClientHeight(49)
    notifyViewportResize()
    onRender.mockClear()

    notifyViewportResize()

    expect(onRender).not.toHaveBeenCalled()
  })

  it("observes the viewport only while using CSS heights", () => {
    const { viewport, viewportObserver, setHeight, setClientHeight, unmount } =
      renderResponsiveList()
    expect(MockResizeObserver.instances).toHaveLength(2)
    expect(viewportObserver.observe).toHaveBeenCalledExactlyOnceWith(viewport)

    setHeight("50dvh")
    expect(MockResizeObserver.instances).toHaveLength(2)
    expect(viewportObserver.disconnect).not.toHaveBeenCalled()

    setHeight(49)
    expect(viewportObserver.disconnect).toHaveBeenCalledTimes(1)
    expect(viewport.textContent).toBe("a")

    setClientHeight(99)
    setHeight("auto")
    expect(MockResizeObserver.instances).toHaveLength(3)
    expect(viewport.textContent).toBe("ab")

    unmount()
    expect(MockResizeObserver.instances[2].disconnect).toHaveBeenCalledTimes(1)
  })
})
