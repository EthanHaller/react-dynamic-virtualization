import { usePositionStore } from "./usePositionStore"
import { useSyncExternalStore } from "react"

export function usePositions(itemIds: string[], gap: number) {
  const positionStore = usePositionStore(itemIds, gap)
  const positionSnapshot = useSyncExternalStore(
    positionStore.subscribe,
    positionStore.getSnapshot,
  )
  return { positionStore, positionSnapshot }
}
