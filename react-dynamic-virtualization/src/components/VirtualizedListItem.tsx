import { useCallback } from "react"
import { useMeasuredItem } from "../hooks/useMeasuredHeight"
import { setMeasuredHeight } from "../cache/measurementCache"

type VirtualizedListItemProps = React.HTMLAttributes<HTMLDivElement> & {
  itemId: string
}

export function VirtualizedListItem({
  children,
  itemId,
  ...props
}: VirtualizedListItemProps) {
  const onSizeChange = useCallback(
    (height: number) => {
      setMeasuredHeight(itemId, height)
    },
    [itemId],
  )

  const ref = useMeasuredItem(onSizeChange)

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
}
