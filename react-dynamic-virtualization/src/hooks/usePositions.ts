import { usePositionStore } from "./usePositionStore"
import { useSyncExternalStore } from "react"
import type { PositionStoreOptions } from "../position/positionStore"

export function usePositions(itemIds: string[], options: PositionStoreOptions) {
  const positionStore = usePositionStore(itemIds, options)
  const positionSnapshot = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot,
  )
  return { positionStore, positionSnapshot }
}
