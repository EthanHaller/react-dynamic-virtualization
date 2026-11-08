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
  gap?: number
  paddingStart?: number
  paddingEnd?: number
  className?: string
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
    gap = 0,
    paddingStart = 0,
    paddingEnd = 0,
    className,
    renderItem,
    scrollElementRef,
  } = props
  const padding = useMemo(() => {
    const values = { gap, paddingStart, paddingEnd }
    for (const [name, value] of Object.entries(values)) {
      if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${name} must be a finite, nonnegative number`)
      }
    }
    return { paddingStart, paddingEnd }
  }, [gap, paddingStart, paddingEnd])

  const scrollDimension = orientation === "horizontal" ? "width" : "height"
  const requestedSize = orientation === "horizontal" ? width : height
  const { viewportProps, viewportSize, scrollOffset } =
    useMeasureListViewport(scrollDimension, requestedSize, scrollElementRef)
  const itemIds = useMemo(() => items.map(getItemId), [items, getItemId])

  const { positionStore, positionSnapshot } = usePositions(itemIds, gap)

  const handleMeasure = useCallback(
    (itemId: string, size: number) => {
      positionStore.updateSize(itemId, size)
    },
    [positionStore],
  )

  const { getItemRef } = useMeasuredItems(scrollDimension, handleMeasure)

  const { startIndex, endIndex } = positionSnapshot.getRenderRange(
    scrollOffset,
    viewportSize,
    overscan,
    padding,
  )
  const renderedItems = []

  for (let index = startIndex; index < endIndex; index++) {
    const item = items[index]
    const itemId = itemIds[index]
    const position = positionSnapshot.getPosition(itemId, padding)

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

  const totalSize = positionSnapshot.getTotalSize(padding)

  const hasContent = items.length > 0 || totalSize > 0

  return (
    <div
      {...viewportProps}
      className={className}
      dir={orientation === "horizontal" ? "ltr" : undefined}
      style={{
        height,
        width,
        overflowY: orientation === "horizontal" ? "hidden" : "auto",
        overflowX: orientation === "horizontal" ? "auto" : undefined,
        position: hasContent ? "relative" : undefined,
      }}
    >
      {hasContent && (
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
