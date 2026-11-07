import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
  type UIEvent,
} from "react"

// Reads the scroll offset and viewport size used for range lookup.
export function useMeasureListViewport(
  scrollDimension: "height" | "width",
  requestedSize: number | string,
  scrollElementRef?: Ref<HTMLDivElement>,
) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const [measuredSize, setMeasuredSize] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pixelSize =
    typeof requestedSize === "number" ? requestedSize : undefined
  const shouldMeasureSize = pixelSize === undefined

  const scrollOffsetProperty = scrollDimension === "width" ? "scrollLeft" : "scrollTop"
  const clientSizeProperty = scrollDimension === "width" ? "clientWidth" : "clientHeight"

  useImperativeHandle(scrollElementRef, () => viewportRef.current!, [])

  useLayoutEffect(() => {
    if (!shouldMeasureSize) {
      return
    }

    const viewport = viewportRef.current!
    let lastObservedSize: number | undefined

    const measureViewportSize = () => {
      const clientSize = viewport[clientSizeProperty]
      if (clientSize === lastObservedSize) {
        return
      }

      lastObservedSize = clientSize
      setMeasuredSize(clientSize)
      // A resize can clamp the scroll offset before the scroll event arrives.
      setScrollOffset(viewport[scrollOffsetProperty])
    }

    const observer = new ResizeObserver(measureViewportSize)
    observer.observe(viewport)
    measureViewportSize()

    return () => observer.disconnect()
  }, [clientSizeProperty, scrollOffsetProperty, shouldMeasureSize])

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollOffset(event.currentTarget[scrollOffsetProperty])
  }, [scrollOffsetProperty])

  return {
    viewportProps: { ref: viewportRef, onScroll: handleScroll },
    viewportSize: pixelSize ?? measuredSize,
    scrollOffset,
  }
}
