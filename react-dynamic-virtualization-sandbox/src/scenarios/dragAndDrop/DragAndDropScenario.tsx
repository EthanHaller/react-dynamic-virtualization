import type { ScenarioExperimentHandle } from "../types"
import { useImperativeHandle, useCallback, useMemo, useRef, useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { ListConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./DragAndDropScenario.css"

type DragAndDropScenarioProps = {
  ref: React.Ref<ScenarioExperimentHandle>
  config: ListConfig
  onRenderedItemCountChange: (count: number) => void
}

export function DragAndDropScenario({
  ref,
  config,
  onRenderedItemCountChange,
}: DragAndDropScenarioProps) {
  const initialItems = useMemo(
    () => createItems(config.itemCount),
    [config.itemCount],
  )

  const [items, setItems] = useState<SandboxItem[]>(initialItems)

  const draggedItemId = useRef<string | null>(null)
  const [draggedOverItemId, setDraggedOverItemId] = useState<string | null>(null)
  const renderedItems = useRef(new Set<string>())
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((itemId: string) => {
    draggedItemId.current = itemId
  }, [])

  const handleDragEnd = useCallback(() => {
    draggedItemId.current = null
    setDraggedOverItemId(null)
  }, [])

  const handleDrop = useCallback((targetItemId: string) => {
    const sourceItemId = draggedItemId.current

    if (!sourceItemId || sourceItemId === targetItemId) {
      return
    }

    draggedItemId.current = null
    setDraggedOverItemId(null)
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
  }, [])

  useImperativeHandle(ref, () => ({
    resetExperiment(configuration) {
      setItems(createItems(configuration.itemCount))
      draggedItemId.current = null
      setDraggedOverItemId(null)
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
    <div className="drag-and-drop-scenario">
      <div className="drag-and-drop-help">
        Drag an item onto another item to reorder the list.
      </div>

      <VirtualizedList
        scrollElementRef={scrollElementRef}
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <DragAndDropItem
            item={item}
            dragOver={draggedOverItemId === item.id}
            onDragOver={() => setDraggedOverItemId(item.id)}
            onDragLeave={() => setDraggedOverItemId(null)}
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
  dragOver: boolean
  onDragOver: () => void
  onDragLeave: () => void
  item: SandboxItem
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
}

function DragAndDropItem({
  dragOver,
  onDragOver,
  onDragLeave,
  item,
  ref,
  style,
  onDragStart,
  onDragEnd,
  onDrop,
}: DragAndDropItemProps) {
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
        onDragLeave()
        onDragEnd()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        event.preventDefault()
        onDragLeave()
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
