import type { ScenarioExperimentHandle } from "../types"
import { useImperativeHandle, useCallback, useRef, useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { ListConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./MutationsScenario.css"

type MutationsScenarioProps = {
  ref: React.Ref<ScenarioExperimentHandle>
  config: ListConfig
  onRenderedItemCountChange: (count: number) => void
}

export function MutationsScenario({
  ref,
  config,
  onRenderedItemCountChange,
}: MutationsScenarioProps) {
  const [items, setItems] = useState<SandboxItem[]>(() =>
    createItems(config.itemCount),
  )

  const nextIndex = useRef(config.itemCount)
  const renderedItems = useRef(new Set<string>())
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const addItem = useCallback(() => {
    const index = nextIndex.current
    nextIndex.current += 1

    const item: SandboxItem = {
      id: `item-${index}`,
      index,
      content: `New item ${index}. This item was added to the list after initial render.`,
    }

    setItems((current) => [...current, item])
  }, [])

  const removeItem = useCallback(() => {
    setItems((current) => {
      if (current.length === 0) {
        return current
      }

      return current.slice(0, -1)
    })
  }, [])

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
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
  }, [])

  const reverseItems = useCallback(() => {
    setItems((current) => [...current].reverse())
  }, [])

  const shuffleItems = useCallback(() => {
    setItems((current) => {
      const next = [...current]

      for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))

        ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      }

      return next
    })
  }, [])

  const resetItems = useCallback(() => {
    nextIndex.current = config.itemCount
    setItems(createItems(config.itemCount))
  }, [config.itemCount])

  useImperativeHandle(ref, () => ({
    resetExperiment(configuration) {
      nextIndex.current = configuration.itemCount
      setItems(createItems(configuration.itemCount))
      scrollElementRef.current?.scrollTo({ top: 0, behavior: "instant" })
    },
  }), [])

  const handleItemRef = useCallback((itemId: string, element: HTMLDivElement | null) => {
    if (element) {
      renderedItems.current.add(itemId)
    } else {
      renderedItems.current.delete(itemId)
    }

    onRenderedItemCountChange(renderedItems.current.size)
  }, [onRenderedItemCountChange])

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

        <span className="mutation-count">
          {items.length.toLocaleString()} items
        </span>
      </div>

      <VirtualizedList
        scrollElementRef={scrollElementRef}
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
