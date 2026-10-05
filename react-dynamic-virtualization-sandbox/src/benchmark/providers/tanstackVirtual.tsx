import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import type { BenchmarkProvider } from "../types"

export const tanstackVirtualProvider: BenchmarkProvider = {
  id: "tanstack-virtual",
  name: "TanStack Virtual",
  description: "TanStack's React virtualization library.",

  List: ({ items, height, overscan, renderItem }) => {
    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
      count: items.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 80,
      overscan,
    })

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
                {renderItem(item, {
                  ref: () => {},
                  style: {},
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
}
