import { useLayoutEffect, useRef } from "react"
import { PositionStore } from "../position/positionStore"

export function usePositionStore(itemIds: string[]): PositionStore {
  const storeRef = useRef<PositionStore | null>(null)

  if (storeRef.current === null) {
    storeRef.current = new PositionStore(itemIds)
  }

  useLayoutEffect(() => {
    storeRef.current!.setItemIds(itemIds)
  }, [itemIds])

  return storeRef.current
}
