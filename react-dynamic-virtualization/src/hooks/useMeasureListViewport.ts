import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
  type UIEvent,
} from "react"

// Reads the scroll offset and viewport height used for range lookup.
export function useMeasureListViewport(
  requestedHeight: number | string,
  scrollElementRef?: Ref<HTMLDivElement>,
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [measuredHeight, setMeasuredHeight] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pixelHeight =
    typeof requestedHeight === "number" ? requestedHeight : undefined
  const shouldMeasureHeight = pixelHeight === undefined

  useImperativeHandle(scrollElementRef, () => viewportRef.current!, [])

  useLayoutEffect(() => {
    if (!shouldMeasureHeight) {
      return
    }

    const viewport = viewportRef.current!
    let lastObservedHeight: number | undefined

    const measureViewportHeight = () => {
      const clientHeight = viewport.clientHeight
      if (clientHeight === lastObservedHeight) {
        return
      }

      lastObservedHeight = clientHeight
      setMeasuredHeight(clientHeight)
      // A resize can clamp the scroll offset before the scroll event arrives.
      setScrollTop(viewport.scrollTop)
    }

    const observer = new ResizeObserver(measureViewportHeight)
    observer.observe(viewport)
    measureViewportHeight()

    return () => observer.disconnect()
  }, [shouldMeasureHeight])

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    viewportProps: { ref: viewportRef, onScroll: handleScroll },
    viewportHeight: pixelHeight ?? measuredHeight,
    scrollTop,
  }
}
