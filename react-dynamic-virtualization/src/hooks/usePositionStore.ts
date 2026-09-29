import { useRef } from "react"
import { PositionStore } from "../position/positionStore"

function areItemIdsEqual(previousIds: string[], nextIds: string[]): boolean {
  if (previousIds.length !== nextIds.length) {
    return false
  }

  for (let index = 0; index < nextIds.length; index++) {
    if (previousIds[index] !== nextIds[index]) {
      return false
    }
  }

  return true
}

export function usePositionStore(itemIds: string[]): PositionStore {
  const storeRef = useRef<PositionStore | null>(null)
  const itemIdsRef = useRef<string[] | null>(null)

  if (storeRef.current === null || itemIdsRef.current === null) {
    storeRef.current = new PositionStore(itemIds)
    itemIdsRef.current = itemIds
  } else if (!areItemIdsEqual(itemIdsRef.current, itemIds)) {
    const previousHeights = storeRef.current.getHeights()

    storeRef.current = new PositionStore(itemIds, previousHeights)

    itemIdsRef.current = itemIds
  }

  return storeRef.current
}
