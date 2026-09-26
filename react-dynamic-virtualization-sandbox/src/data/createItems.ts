import type { SandboxItem } from "./types"

const content = [
  "Short item.",
  "This is a slightly longer item with enough content to take up more space.",
  "This item contains a longer description. It is useful for creating realistic variation in item heights within the virtualized list.",
  "This is a particularly long item with enough text to wrap across multiple lines and produce a substantially larger DOM element than the smaller items.",
]

function getContent(index: number): string {
  const baseContent = content[index % content.length]
  const repetitions = 1 + ((index * 13) % 4)

  return Array.from({ length: repetitions }, () => baseContent).join(" ")
}

export function createItems(count: number): SandboxItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    index,
    content: getContent(index),
  }))
}
