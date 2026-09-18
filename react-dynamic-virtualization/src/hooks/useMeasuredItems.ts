import { useCallback, useLayoutEffect, useRef } from "react"

export function useMeasuredItems(
  onMeasure: (itemId: string, height: number) => void,
): {
  getItemRef: (itemId: string) => (element: HTMLDivElement | null) => void
} {
  const itemIdByElement = useRef(new Map<HTMLDivElement, string>())
  const elementByItemId = useRef(new Map<string, HTMLDivElement>())

  const observerRef = useRef<ResizeObserver | null>(null)

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLDivElement
        const itemId = itemIdByElement.current.get(element)

        if (itemId === undefined) {
          continue
        }

        onMeasure(itemId, entry.contentRect.height)
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
  }, [])

  const getItemRef = useCallback((itemId: string) => {
    return (element: HTMLDivElement | null) => {
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
