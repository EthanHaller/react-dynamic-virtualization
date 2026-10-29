import { useCallback, useRef } from "react"

// Count mounted logical rows identically for every provider. Publish once after the
// commit so ref detach/attach pairs never appear as diagnostic count changes.
export function useRenderedItemTracking(onRenderedItemCountChange: (count: number) => void) {
  const mountedItemIds = useRef(new Set<string>())
  const publicationScheduled = useRef(false)

  return useCallback((itemId: string, element: HTMLElement | null) => {
    if (element) mountedItemIds.current.add(itemId)
    else mountedItemIds.current.delete(itemId)
    if (publicationScheduled.current) return
    publicationScheduled.current = true
    queueMicrotask(() => {
      publicationScheduled.current = false
      onRenderedItemCountChange(mountedItemIds.current.size)
    })
  }, [onRenderedItemCountChange])
}
