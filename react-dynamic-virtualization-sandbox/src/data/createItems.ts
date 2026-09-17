import type { SandboxItem } from "./types"

const content = [
  "Short item",
  "This is a slightly longer item with enough content to take up more space.",
  "This item contains a longer description. It is useful for creating realistic variation in item heights within the virtualized list.",
  "This is a particularly long item with enough text to wrap across multiple lines and produce a substantially larger DOM element than the smaller items.",
]

export function createItems(count: number): SandboxItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    index,
    content: content[index % content.length],
  }))
}
