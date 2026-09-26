import { usePositionStore } from "./usePositionStore"
import { useSyncExternalStore } from "react"

export function usePositions(itemIds: string[]) {
  const positionStore = usePositionStore(itemIds)
  const positionSnapshot = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot,
  )
  return { positionStore, positionSnapshot }
}
