import { useCallback, useLayoutEffect, useRef } from "react"

export function useResizeObserver(
  onResize: (entries: ResizeObserverEntry[]) => void,
) {
  const observerRef = useRef<ResizeObserver | null>(null)

  useLayoutEffect(() => {
    const observer = new ResizeObserver(onResize)

    observerRef.current = observer

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [onResize])

  const observe = useCallback((element: Element) => {
    observerRef.current?.observe(element)
  }, [])

  const unobserve = useCallback((element: Element) => {
    observerRef.current?.unobserve(element)
  }, [])

  return { observe, unobserve }
}
