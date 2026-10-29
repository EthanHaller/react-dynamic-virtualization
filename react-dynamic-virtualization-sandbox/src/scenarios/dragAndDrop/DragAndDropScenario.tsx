import type { ScenarioExperimentHandle } from "../types"
import { memo, useImperativeHandle, useCallback, useMemo, useRef, useState } from "react"
import { ScenarioList } from "../../providers/ScenarioList"
import type { ProviderListHandle } from "../../providers/types"
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
  const providerListRef = useRef<ProviderListHandle>(null)

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
      providerListRef.current?.scrollToOffset?.(0)
    },
  }), [])

  return (
    <div className="drag-and-drop-scenario">
      <div className="drag-and-drop-help">
        Drag an item onto another item to reorder the list.
      </div>

      <ScenarioList
        ref={providerListRef}
        items={items}
        config={config}
        onRenderedItemCountChange={onRenderedItemCountChange}
        getRowPresentation={(item) => ({
          className: `drag-and-drop-item${draggedOverItemId === item.id ? " drag-over" : ""}`,
          draggable: true,
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move"
            handleDragStart(item.id)
          },
          onDragEnd: handleDragEnd,
          onDragOver: (event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = "move"
            setDraggedOverItemId(item.id)
          },
          onDragLeave: () => setDraggedOverItemId(null),
          onDrop: (event) => {
            event.preventDefault()
            setDraggedOverItemId(null)
            handleDrop(item.id)
          },
        })}
        renderRowBody={(item) => <DragAndDropItemBody item={item} />}
      />
    </div>
  )
}

const DragAndDropItemBody = memo(function DragAndDropItemBody({ item }: { item: SandboxItem }) {
  return (
      <div className="drag-and-drop-item-content">
        <span className="drag-handle" aria-hidden="true">
          ⋮⋮
        </span>

        <span className="drag-and-drop-item-index">#{item.index}</span>

        <span>{item.content}</span>
      </div>
  )
})
