import { useCallback, useLayoutEffect, useRef } from "react"

export function useMeasuredItems(
  scrollDimension: "height" | "width",
  onMeasure: (itemId: string, size: number) => void,
): {
  getItemRef: (itemId: string) => (element: HTMLElement | null) => void
} {
  const itemIdByElement = useRef(new Map<Element, string>())
  const elementByItemId = useRef(new Map<string, HTMLElement>())
  const observerRef = useRef<ResizeObserver | null>(null)
  const onMeasureRef = useRef(onMeasure)
  onMeasureRef.current = onMeasure

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const itemId = itemIdByElement.current.get(entry.target)

        if (itemId === undefined) {
          continue
        }

        onMeasureRef.current(itemId, entry.contentRect[scrollDimension])
      }
    })

    observerRef.current = observer

    for (const element of elementByItemId.current.values()) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
      observerRef.current = null
      itemIdByElement.current.clear()
      elementByItemId.current.clear()
    }
  }, [scrollDimension])

  const getItemRef = useCallback((itemId: string) => {
    return (element: HTMLElement | null) => {
      const previousElement = elementByItemId.current.get(itemId)

      if (previousElement !== undefined) {
        if (previousElement === element) {
          return
        }

        observerRef.current?.unobserve(previousElement)
        itemIdByElement.current.delete(previousElement)
        elementByItemId.current.delete(itemId)
      }

      if (element === null) {
        return
      }

      itemIdByElement.current.set(element, itemId)
      elementByItemId.current.set(itemId, element)
      observerRef.current?.observe(element)
    }
  }, [])

  return { getItemRef }
}
