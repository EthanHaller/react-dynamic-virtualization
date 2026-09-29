import { useEffect, useRef, useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./MutationsScenario.css"

type MutationsScenarioProps = {
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function MutationsScenario({
  config,
  onRenderedItemCountChange,
}: MutationsScenarioProps) {
  const [items, setItems] = useState<SandboxItem[]>(() =>
    createItems(config.itemCount),
  )

  const nextIndex = useRef(config.itemCount)
  const renderedItems = useRef(new Set<string>())

  useEffect(() => {
    const nextItems = createItems(config.itemCount)

    setItems(nextItems)
    nextIndex.current = config.itemCount
    renderedItems.current.clear()
    onRenderedItemCountChange(0)
  }, [config.itemCount, onRenderedItemCountChange])

  function addItem() {
    const index = nextIndex.current
    nextIndex.current += 1

    const item: SandboxItem = {
      id: `item-${index}`,
      index,
      content: `New item ${index}. This item was added to the list after initial render.`,
    }

    setItems((current) => [...current, item])
  }

  function removeItem() {
    setItems((current) => {
      if (current.length === 0) {
        return current
      }

      return current.slice(0, -1)
    })
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
    <div className="mutations-scenario">
      <div className="mutation-controls">
        <button type="button" onClick={addItem}>
          Add item
        </button>

        <button
          type="button"
          onClick={removeItem}
          disabled={items.length === 0}
        >
          Remove item
        </button>

        <span className="mutation-count">
          {items.length.toLocaleString()} items
        </span>
      </div>

      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <MutationItem
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

type MutationItemProps = {
  item: SandboxItem
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function MutationItem({ item, ref, style }: MutationItemProps) {
  return (
    <div ref={ref} className="mutation-item" style={style}>
      <div className="mutation-item-content">
        <span className="mutation-item-index">#{item.index}</span>
        <span>{item.content}</span>
      </div>
    </div>
  )
}
