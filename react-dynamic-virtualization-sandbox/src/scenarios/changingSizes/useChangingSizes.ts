import type { ChangingHeightsConfig } from "../../config/types"
import { useCallback, useEffect, useRef, useState } from "react"

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

  const activeSizeChangeTimer = useRef<number | undefined>(undefined)

  const stopSizeChanges = useCallback(() => {
    window.clearInterval(activeSizeChangeTimer.current)
    activeSizeChangeTimer.current = undefined
  }, [])

  const startSizeChanges = useCallback((configuration: Pick<ChangingHeightsConfig, "itemCount" | "enableSizeChanges" | "changeInterval">) => {
    stopSizeChanges()
    if (!configuration.enableSizeChanges || configuration.itemCount === 0) return

    activeSizeChangeTimer.current = window.setInterval(() => {
      const expandedItemIndexes = new Set<number>()
      const expandedItemCount = Math.floor(configuration.itemCount / 2)
      while (expandedItemIndexes.size < expandedItemCount) {
        expandedItemIndexes.add(Math.floor(Math.random() * configuration.itemCount))
      }
      setExpandedItems(expandedItemIndexes)
    }, configuration.changeInterval)
  }, [stopSizeChanges])

  useEffect(() => {
    startSizeChanges({ itemCount, enableSizeChanges: enabled, changeInterval: interval })
    return stopSizeChanges
  }, [itemCount, enabled, interval, startSizeChanges, stopSizeChanges])

  const resetSizeChanges = useCallback((configuration: ChangingHeightsConfig) => {
    setExpandedItems(new Set())
    startSizeChanges(configuration)
  }, [startSizeChanges])

  return { expandedItems, resetSizeChanges }
}

export function getAdditionalContent(index: number): string {
  return additionalContent[index % additionalContent.length]
}
