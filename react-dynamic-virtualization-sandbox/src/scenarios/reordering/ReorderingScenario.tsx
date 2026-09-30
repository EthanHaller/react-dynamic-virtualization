import { useMemo, useRef, useState, useEffect } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./ReorderingScenario.css"

type ReorderingScenarioProps = {
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function ReorderingScenario({
  config,
  onRenderedItemCountChange,
}: ReorderingScenarioProps) {
  const initialItems = useMemo(
    () => createItems(config.itemCount),
    [config.itemCount],
  )

  const [items, setItems] = useState<SandboxItem[]>(initialItems)
  const renderedItems = useRef(new Set<string>())

  useEffect(() => {
    setItems(createItems(config.itemCount))
    renderedItems.current.clear()
    onRenderedItemCountChange(0)
  }, [config.itemCount, onRenderedItemCountChange])

  function moveItem(fromIndex: number, toIndex: number) {
    setItems((current) => {
      if (
        fromIndex < 0 ||
        fromIndex >= current.length ||
        toIndex < 0 ||
        toIndex >= current.length
      ) {
        return current
      }

      const next = [...current]
      const [item] = next.splice(fromIndex, 1)

      next.splice(toIndex, 0, item)

      return next
    })
  }

  function reverseItems() {
    setItems((current) => [...current].reverse())
  }

  function shuffleItems() {
    setItems((current) => {
      const next = [...current]

      for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))

        ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      }

      return next
    })
  }

  function resetItems() {
    setItems(createItems(config.itemCount))
  }

  function handleItemRef(itemId: string, element: HTMLDivElement | null) {
    if (element) {
      renderedItems.current.add(itemId)
    } else {
      renderedItems.current.delete(itemId)
    }

    onRenderedItemCountChange(renderedItems.current.size)
  }

  return (
    <div className="reordering-scenario">
      <div className="reordering-controls">
        <button
          type="button"
          onClick={() => moveItem(0, items.length - 1)}
          disabled={items.length < 2}
        >
          Move first to end
        </button>

        <button
          type="button"
          onClick={() => moveItem(items.length - 1, 0)}
          disabled={items.length < 2}
        >
          Move last to front
        </button>

        <button
          type="button"
          onClick={reverseItems}
          disabled={items.length < 2}
        >
          Reverse
        </button>

        <button
          type="button"
          onClick={shuffleItems}
          disabled={items.length < 2}
        >
          Shuffle
        </button>

        <button type="button" onClick={resetItems}>
          Reset
        </button>
      </div>

      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <ReorderingItem
            item={item}
            ref={(element) => {
              ref(element)
              handleItemRef(item.id, element)
            }}
            style={style}
          />
        )}
      />
    </div>
  )
}

type ReorderingItemProps = {
  item: SandboxItem
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function ReorderingItem({ item, ref, style }: ReorderingItemProps) {
  return (
    <div ref={ref} className="reordering-item" style={style}>
      <div className="reordering-item-content">
        <span className="reordering-item-index">#{item.index}</span>

        <span>{item.content}</span>
      </div>
    </div>
  )
}
