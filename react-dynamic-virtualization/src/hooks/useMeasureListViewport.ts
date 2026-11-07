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
  requestedSize: number | string,
  scrollElementRef?: Ref<HTMLDivElement>,
) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const [measuredSize, setMeasuredSize] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pixelSize =
    typeof requestedSize === "number" ? requestedSize : undefined
  const shouldMeasureSize = pixelSize === undefined

  useImperativeHandle(scrollElementRef, () => viewportRef.current!, [])

  useLayoutEffect(() => {
    if (!shouldMeasureSize) {
      return
    }

    const viewport = viewportRef.current!
    let lastObservedSize: number | undefined

    const measureViewportSize = () => {
      const clientHeight = viewport.clientHeight
      if (clientHeight === lastObservedSize) {
        return
      }

      lastObservedSize = clientHeight
      setMeasuredSize(clientHeight)
      // A resize can clamp the scroll offset before the scroll event arrives.
      setScrollOffset(viewport.scrollTop)
    }

    const observer = new ResizeObserver(measureViewportSize)
    observer.observe(viewport)
    measureViewportSize()

    return () => observer.disconnect()
  }, [shouldMeasureSize])

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollOffset(event.currentTarget.scrollTop)
  }, [])

  return {
    viewportProps: { ref: viewportRef, onScroll: handleScroll },
    viewportSize: pixelSize ?? measuredSize,
    scrollOffset,
  }
}
