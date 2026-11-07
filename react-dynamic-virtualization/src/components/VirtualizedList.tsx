import { useCallback, useMemo, type Ref } from "react"
import { useMeasureListViewport } from "../hooks/useMeasureListViewport"
import { usePositions } from "../hooks/usePositions"
import { useMeasuredItems } from "../hooks/useMeasuredItems"
import VirtualizedListItem from "./VirtualizedListItem"
import type { RenderItemOptions } from "./VirtualizedListItem"

type VirtualizedListProps<T> = {
  items: T[]
  getItemId: (item: T) => string
  height: number | string
  overscan?: number
  renderItem: (item: T, options: RenderItemOptions) => React.ReactElement
  scrollElementRef?: Ref<HTMLDivElement>
}

export function VirtualizedList<T>({
  items,
  getItemId,
  height,
  overscan = 2,
  renderItem,
  scrollElementRef,
}: VirtualizedListProps<T>) {
  const { viewportProps, viewportHeight, scrollTop } =
    useMeasureListViewport(height, scrollElementRef)
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId])

  const { positionStore, positionSnapshot } = usePositions(itemIds)

  const handleMeasure = useCallback(
    (itemId: string, newHeight: number) => {
      positionStore.updateHeight(itemId, newHeight)
    },
    [positionStore],
  )

  const { getItemRef } = useMeasuredItems(handleMeasure)

  const { startIndex, endIndexExclusive } = positionSnapshot.getRenderRange(
    scrollTop,
    viewportHeight,
    overscan,
  )
  const renderedItems = []

  for (let index = startIndex; index < endIndexExclusive; index++) {
    const item = items[index]
    const itemId = itemIds[index]
    const position = positionSnapshot.getPosition(itemId)

    renderedItems.push(
      <VirtualizedListItem
        key={itemId}
        item={item}
        itemId={itemId}
        position={position}
        getItemRef={getItemRef}
        renderItem={renderItem}
      />,
    )
  }

  return (
    <div
      {...viewportProps}
      style={{
        height,
        overflowY: "auto",
        position: items.length > 0 ? "relative" : undefined,
      }}
    >
      {items.length > 0 && (
        <div
          style={{
            height: positionSnapshot.getTotalHeight(),
            position: "relative",
          }}
        >
          {renderedItems}
        </div>
      )}
    </div>
  )
}
