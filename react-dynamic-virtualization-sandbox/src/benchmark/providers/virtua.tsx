import { VList } from "virtua"

import type { BenchmarkProvider } from "../types"

export const virtuaProvider: BenchmarkProvider = {
  id: "virtua",
  name: "Virtua",
  description: "Virtua's React virtualization library.",

  List: ({ items, height, renderItem }) => (
    <VList data={items} style={{ height }}>
      {(item) => renderItem(item)}
    </VList>
  ),
}
