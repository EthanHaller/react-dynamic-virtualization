import { useEffect, useRef } from "react"

import { useVirtualizer } from "@tanstack/react-virtual"

import type { BenchmarkProvider, BenchmarkScrollController } from "../types"

export const tanstackVirtualProvider: BenchmarkProvider = {
  id: "tanstack-virtual",
  name: "TanStack Virtual",
  description: "TanStack's React virtualization library.",

  List: ({ items, height, overscan, renderItem, onScrollController }) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 80,
      getItemKey: (index) => items[index].id,
      overscan,
    })

    useEffect(() => {
      const controller: BenchmarkScrollController = {
        scrollTo: (position) => {
          const element = parentRef.current

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
      <div
        ref={parentRef}
        style={{
          height,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index]

            return (
              <div
                key={item.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderItem(item)}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
}
