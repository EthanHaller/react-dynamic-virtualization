import { useMemo } from "react"
import { DEFAULT_ITEM_HEIGHT, getMeasuredHeight } from "../cache/measurementCache"
import { PositionStore } from "../position/positionStore"

export function usePositionStore(itemIds: string[]): PositionStore {
  return useMemo(
    () =>
      new PositionStore(
        itemIds,
        (itemId) => getMeasuredHeight(itemId) ?? DEFAULT_ITEM_HEIGHT,
      ),
    [itemIds],
  )
}
