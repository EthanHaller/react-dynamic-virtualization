import { useEffect, useMemo, useRef, useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./DragAndDropScenario.css"

type DragAndDropScenarioProps = {
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function DragAndDropScenario({
  config,
  onRenderedItemCountChange,
}: DragAndDropScenarioProps) {
  const initialItems = useMemo(
    () => createItems(config.itemCount),
    [config.itemCount],
  )

  const [items, setItems] = useState<SandboxItem[]>(initialItems)

  const draggedItemId = useRef<string | null>(null)
  const renderedItems = useRef(new Set<string>())

  useEffect(() => {
    setItems(createItems(config.itemCount))
    draggedItemId.current = null
    renderedItems.current.clear()
    onRenderedItemCountChange(0)
  }, [config.itemCount, onRenderedItemCountChange])

  function handleDragStart(itemId: string) {
    draggedItemId.current = itemId
  }

  function handleDragEnd() {
    draggedItemId.current = null
  }

  function handleDrop(targetItemId: string) {
    const sourceItemId = draggedItemId.current

    if (!sourceItemId || sourceItemId === targetItemId) {
      return
    }

    setItems((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceItemId)
      const targetIndex = current.findIndex((item) => item.id === targetItemId)

      if (sourceIndex === -1 || targetIndex === -1) {
        return current
      }

      const next = [...current]
      const [item] = next.splice(sourceIndex, 1)

      next.splice(targetIndex, 0, item)

      return next
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
    <div className="drag-and-drop-scenario">
      <div className="drag-and-drop-help">
        Drag an item onto another item to reorder the list.
      </div>

      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <DragAndDropItem
            item={item}
            ref={(element) => {
              ref(element)
              handleItemRef(item.id, element)
            }}
            style={style}
            onDragStart={() => handleDragStart(item.id)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(item.id)}
          />
        )}
      />
    </div>
  )
}

type DragAndDropItemProps = {
  item: SandboxItem
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
}

function DragAndDropItem({
  item,
  ref,
  style,
  onDragStart,
  onDragEnd,
  onDrop,
}: DragAndDropItemProps) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      ref={ref}
      className={`drag-and-drop-item${dragOver ? " drag-over" : ""}`}
      style={style}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move"
        onDragStart()
      }}
      onDragEnd={() => {
        setDragOver(false)
        onDragEnd()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        setDragOver(true)
      }}
      onDragLeave={() => {
        setDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setDragOver(false)
        onDrop()
      }}
    >
      <div className="drag-and-drop-item-content">
        <span className="drag-handle" aria-hidden="true">
          ⋮⋮
        </span>

        <span className="drag-and-drop-item-index">#{item.index}</span>

        <span>{item.content}</span>
      </div>
    </div>
  )
}
