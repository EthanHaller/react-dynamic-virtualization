import { useMemo, useRef } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import { getAdditionalContent, useChangingSizes } from "./useChangingSizes"
import "./ChangingSizesScenario.css"

type ChangingSizesScenarioProps = {
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function ChangingSizesScenario({
  config,
  onRenderedItemCountChange,
}: ChangingSizesScenarioProps) {
  const renderedItems = useRef(new Set<string>())

  const items = useMemo(() => createItems(config.itemCount), [config.itemCount])

  const expandedItems = useChangingSizes(
    config.itemCount,
    config.enableSizeChanges,
    config.changeInterval,
  )

  function handleItemRef(itemId: string, element: HTMLDivElement | null) {
    if (element) {
      renderedItems.current.add(itemId)
    } else {
      renderedItems.current.delete(itemId)
    }

    onRenderedItemCountChange(renderedItems.current.size)
  }

  return (
    <div className="changing-sizes-scenario">
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <ChangingSizeItem
            item={item}
            expanded={expandedItems.has(item.index)}
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

type ChangingSizeItemProps = {
  item: SandboxItem
  expanded: boolean
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function ChangingSizeItem({
  item,
  expanded,
  ref,
  style,
}: ChangingSizeItemProps) {
  return (
    <div ref={ref} className="changing-size-item" style={style}>
      <div className="changing-size-item-content">
        <div className="changing-size-item-header">
          <span className="changing-size-item-index">#{item.index}</span>

          <span className="changing-size-item-state">
            {expanded ? "expanded" : "normal"}
          </span>
        </div>

        <span>{item.content}</span>

        {expanded && <span>{getAdditionalContent(item.index)}</span>}
      </div>
    </div>
  )
}
