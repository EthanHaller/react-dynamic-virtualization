import { memo } from "react"

export type RenderItemOptions = {
  ref: (element: HTMLDivElement | null) => void
  style: React.CSSProperties
}

type VirtualizedListItemProps<T> = {
  item: T
  itemId: string
  position: number
  scrollDimension: "height" | "width"
  getItemRef: (itemId: string) => (element: HTMLDivElement | null) => void
  renderItem: (item: T, options: RenderItemOptions) => React.ReactElement
}

function VirtualizedListItem<T>({
  item,
  itemId,
  position,
  scrollDimension,
  getItemRef,
  renderItem,
}: VirtualizedListItemProps<T>) {
  return renderItem(item, {
    ref: getItemRef(itemId),
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      width: scrollDimension === "height" ? "100%" : undefined,
      transform: scrollDimension === "width"
        ? `translateX(${position}px)`
        : `translateY(${position}px)`,
    },
  })
}

export default memo(VirtualizedListItem) as typeof VirtualizedListItem
