import { useMemo } from "react"

import { PositionStore } from "../position/positionStore"

export function usePositionStore(itemIds: string[]): PositionStore {
  return useMemo(() => new PositionStore(itemIds), [itemIds])
}
