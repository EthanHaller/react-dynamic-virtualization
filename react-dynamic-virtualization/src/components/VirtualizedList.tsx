import { useCallback, useMemo, type Ref } from "react"
import { useMeasureListViewport } from "../hooks/useMeasureListViewport"
import { usePositions } from "../hooks/usePositions"
import { useMeasuredItems } from "../hooks/useMeasuredItems"
import VirtualizedListItem from "./VirtualizedListItem"
import type { RenderItemOptions } from "./VirtualizedListItem"

type ViewportDimensions =
  | { orientation?: "vertical"; height: number | string; width?: number }
  | { orientation: "horizontal"; width: number; height?: number | string }

type VirtualizedListProps<T> = ViewportDimensions & {
  items: T[]
  getItemId: (item: T) => string
  overscan?: number
  renderItem: (item: T, options: RenderItemOptions) => React.ReactElement
  scrollElementRef?: Ref<HTMLDivElement>
}

export function VirtualizedList<T>(props: VirtualizedListProps<T>) {
  // Measurements and scroll offsets belong to the axis they were taken on.
  return <ListOnAxis key={props.orientation ?? "vertical"} {...props} />
}

function ListOnAxis<T>(props: VirtualizedListProps<T>) {
  const {
    items,
    getItemId,
    height,
    width,
    orientation,
    overscan = 2,
    renderItem,
    scrollElementRef,
  } = props
  const scrollDimension = orientation === "horizontal" ? "width" : "height"
  const requestedSize = orientation === "horizontal" ? width : height
  const { viewportProps, viewportSize, scrollOffset } =
    useMeasureListViewport(scrollDimension, requestedSize, scrollElementRef)
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId])

  const { positionStore, positionSnapshot } = usePositions(itemIds)

  const handleMeasure = useCallback(
    (itemId: string, size: number) => {
      positionStore.updateSize(itemId, size)
    },
    [positionStore],
  )

  const { getItemRef } = useMeasuredItems(scrollDimension, handleMeasure)

  const { startIndex, endIndexExclusive } = positionSnapshot.getRenderRange(
    scrollOffset,
    viewportSize,
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
        scrollDimension={scrollDimension}
        getItemRef={getItemRef}
        renderItem={renderItem}
      />,
    )
  }

  const totalSize = positionSnapshot.getTotalSize()

  return (
    <div
      {...viewportProps}
      dir={orientation === "horizontal" ? "ltr" : undefined}
      style={{
        height,
        width,
        overflowY: orientation === "horizontal" ? "hidden" : "auto",
        overflowX: orientation === "horizontal" ? "auto" : undefined,
        position: items.length > 0 ? "relative" : undefined,
      }}
    >
      {items.length > 0 && (
        <div
          style={{
            width: orientation === "horizontal" ? totalSize : undefined,
            height: orientation === "horizontal" ? "100%" : totalSize,
            position: "relative",
          }}
        >
          {renderedItems}
        </div>
      )}
    </div>
  )
}
