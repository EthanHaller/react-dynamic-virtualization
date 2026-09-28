import { useEffect, useState } from "react"

const additionalContent = [
  " Additional content has been added to this item.",
  " The item is now larger than it was before.",
  " This content change forces the element to grow and should trigger a new measurement.",
]

export function useChangingSizes(
  itemCount: number,
  enabled: boolean,
  interval: number,
) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(
    () => new Set(),
  )

  useEffect(() => {
    if (!enabled || itemCount === 0) {
      return
    }

    const timer = window.setInterval(() => {
      setExpandedItems(() => {
        const next = new Set<number>()
        const expandedCount = Math.floor(itemCount / 2)

        while (next.size < expandedCount) {
          const index = Math.floor(Math.random() * itemCount)
          next.add(index)
        }

        return next
      })
    }, interval)

    return () => {
      window.clearInterval(timer)
    }
  }, [itemCount, enabled, interval])

  return expandedItems
}

export function getAdditionalContent(index: number): string {
  return additionalContent[index % additionalContent.length]
}
