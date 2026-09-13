import { useCallback, useMemo, useReducer, useRef, useState } from "react"

import { getMeasuredHeight, setMeasuredHeight } from "../cache/measurementCache"
import { PositionTree } from "../position/positionTree"
import { useResizeObserver } from "../hooks/useResizeObserver"

const DEFAULT_ITEM_HEIGHT = 50

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
  const [, forceRender] = useReducer((value) => value + 1, 0)
  const [scrollTop, setScrollTop] = useState(0)

  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId])

  const positionTree = useMemo(
    () =>
      new PositionTree(
        itemIds,
        (itemId) => getMeasuredHeight(itemId) ?? DEFAULT_ITEM_HEIGHT,
      ),
    [itemIds],
  )

  const positionTreeRef = useRef(positionTree)
  positionTreeRef.current = positionTree

  const itemIdByElement = useRef(new Map<HTMLDivElement, string>())

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    let changed = false

    for (const entry of entries) {
      const element = entry.target as HTMLDivElement
      const itemId = itemIdByElement.current.get(element)

      if (itemId === undefined) {
        continue
      }

      const newHeight = entry.contentRect.height
      const oldHeight = getMeasuredHeight(itemId) ?? DEFAULT_ITEM_HEIGHT

      if (newHeight === oldHeight) {
        continue
      }

      setMeasuredHeight(itemId, newHeight)

      positionTreeRef.current.updateHeight(itemId, newHeight - oldHeight)

      changed = true
    }

    if (changed) {
      forceRender()
    }
  }, [])

  const { observe, unobserve } = useResizeObserver(handleResize)

  const setItemRef = useCallback(
    (itemId: string) => (element: HTMLDivElement | null) => {
      if (element === null) {
        for (const [
          existingElement,
          existingItemId,
        ] of itemIdByElement.current) {
          if (existingItemId === itemId) {
            unobserve(existingElement)
            itemIdByElement.current.delete(existingElement)
            break
          }
        }

        return
      }

      itemIdByElement.current.set(element, itemId)
      observe(element)
    },
    [observe, unobserve],
  )

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

  const firstVisibleIndex = positionTree.getIndexAtPosition(scrollTop)

  const lastVisibleIndex = positionTree.getIndexAtPosition(
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
    const position = positionTree.getPosition(itemId)

    renderedItems.push(
      renderItem(item, {
        ref: setItemRef(itemId),
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
          height: positionTree.getTotalHeight(),
          position: "relative",
        }}
      >
        {renderedItems}
      </div>
    </div>
  )
}
