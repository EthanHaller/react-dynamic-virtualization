import { useEffect, useRef } from "react"

import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"

import type { BenchmarkProvider, BenchmarkScrollController } from "../types"

export const reactDynamicVirtualizationProvider: BenchmarkProvider = {
  id: "react-dynamic-virtualization",
  name: "React Dynamic Virtualization",
  description: "The library being developed in this project.",

  List: ({ items, height, overscan, renderItem, onScrollController }) => {
    const scrollElementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const controller: BenchmarkScrollController = {
        scrollTo: (position) => {
          const element = scrollElementRef.current

          if (!element) {
            return
          }

          const maxScrollTop = element.scrollHeight - element.clientHeight

          element.scrollTop = maxScrollTop * position
        },
      }

      onScrollController(controller)

      return () => {
        onScrollController(null)
      }
    }, [onScrollController])

    return (
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={height}
        overscan={overscan}
        renderItem={renderItem}
        scrollElementRef={scrollElementRef}
      />
    )
  },
}
