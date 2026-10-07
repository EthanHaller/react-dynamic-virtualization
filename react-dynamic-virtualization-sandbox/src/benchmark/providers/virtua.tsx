import { useEffect, useRef } from "react"

import { VList, type VListHandle } from "virtua"

import type { BenchmarkProvider, BenchmarkScrollController } from "../types"

export const virtuaProvider: BenchmarkProvider = {
  id: "virtua",
  name: "Virtua",
  description: "Virtua's React virtualization library.",

  List: ({ items, height, renderItem, onScrollController }) => {
    const listRef = useRef<VListHandle>(null)

    useEffect(() => {
      const controller: BenchmarkScrollController = {
        scrollTo: (position) => {
          const maxIndex = Math.max(items.length - 1, 0)

          listRef.current?.scrollToIndex(Math.round(maxIndex * position))
        },
      }

      onScrollController(controller)

      return () => {
        onScrollController(null)
      }
    }, [items.length, onScrollController])

    return (
      <VList ref={listRef} data={items} style={{ height }}>
        {(item) => renderItem(item)}
      </VList>
    )
  },
}
