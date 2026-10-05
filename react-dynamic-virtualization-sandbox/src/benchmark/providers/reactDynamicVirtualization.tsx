import type { BenchmarkProvider } from "../types"

import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"

export const reactDynamicVirtualizationProvider: BenchmarkProvider = {
  id: "react-dynamic-virtualization",
  name: "React Dynamic Virtualization",
  description: "The library being developed in this project.",

  List: ({ items, height, overscan, renderItem }) => (
    <VirtualizedList
      items={items}
      getItemId={(item) => item.id}
      height={height}
      overscan={overscan}
      renderItem={(item, { ref, style }) => (
        <div ref={ref} style={style}>
          {renderItem(item)}
        </div>
      )}
    />
  ),
}
