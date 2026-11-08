import { useRef } from "react"
import { PositionStore } from "../position/positionStore"

function areItemIdsEqual(previousIds: string[], nextIds: string[]): boolean {
  if (previousIds === nextIds) {
    return true
  }

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

export function usePositionStore(itemIds: string[], gap = 0): PositionStore {
  const storeRef = useRef<PositionStore | null>(null)
  const itemIdsRef = useRef<string[] | null>(null)

  if (
    storeRef.current === null ||
    itemIdsRef.current === null ||
    storeRef.current.gap !== gap ||
    !areItemIdsEqual(itemIdsRef.current, itemIds)
  ) {
    storeRef.current = new PositionStore(itemIds, storeRef.current?.getSizes(), gap)
    itemIdsRef.current = itemIds
  }

  return storeRef.current
}
