import { useMemo } from "react"

import { getMeasuredHeight } from "../cache/measurementCache"
import { PositionStore } from "../position/positionStore"

const DEFAULT_ITEM_HEIGHT = 50

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
