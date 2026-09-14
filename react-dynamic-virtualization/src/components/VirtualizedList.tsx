import { useCallback, useMemo, useState, useSyncExternalStore } from "react"
import { DEFAULT_ITEM_HEIGHT, getMeasuredHeight, setMeasuredHeight } from "../cache/measurementCache"
import { useMeasuredItems } from "../hooks/useMeasuredItems"
import { usePositionStore } from "../hooks/usePositionStore"

type RenderItemOptions = {
  ref: (element: HTMLDivElement | null) => void
  style: React.CSSProperties
}

type VirtualizedListProps<T> = {
  items: T[]
  getItemId: (item: T) => string
  height: number
  overscan?: number
  renderItem: (item: T, options: RenderItemOptions) => React.ReactElement
}

export function VirtualizedList<T>({
  items,
  getItemId,
  height,
  overscan = 2,
  renderItem,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId])

  const positionStore = usePositionStore(itemIds)
  useSyncExternalStore(positionStore.subscribe, positionStore.getSnapshot)

  const handleMeasure = useCallback(
    (itemId: string, newHeight: number) => {
      const oldHeight = getMeasuredHeight(itemId) ?? DEFAULT_ITEM_HEIGHT

      if (newHeight === oldHeight) {
        return
      }

      setMeasuredHeight(itemId, newHeight)

      positionStore.updateHeight(itemId, newHeight - oldHeight)
    },
    [positionStore],
  )

  const { getItemRef } = useMeasuredItems(handleMeasure)

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  if (items.length === 0) {
    return (
      <div
        style={{
          height,
          overflowY: "auto",
        }}
        onScroll={handleScroll}
      />
    )
  }

  const firstVisibleIndex = positionStore.getIndexAtPosition(scrollTop)
  const lastVisibleIndex = positionStore.getIndexAtPosition(
    scrollTop + height - 1,
  )

  const firstIndex = Math.max(
    0,
    (firstVisibleIndex === -1 ? 0 : firstVisibleIndex) - overscan,
  )
  const lastIndex = Math.min(
    items.length - 1,
    (lastVisibleIndex === -1 ? items.length - 1 : lastVisibleIndex) + overscan,
  )

  const renderedItems = []

  for (let index = firstIndex; index <= lastIndex; index++) {
    const item = items[index]
    const itemId = itemIds[index]
    const position = positionStore.getPosition(itemId)

    renderedItems.push(
      renderItem(item, {
        ref: getItemRef(itemId),
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${position}px)`,
        },
      }),
    )
  }

  return (
    <div
      style={{
        height,
        overflowY: "auto",
        position: "relative",
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: positionStore.getTotalHeight(),
          position: "relative",
        }}
      >
        {renderedItems}
      </div>
    </div>
  )
}
