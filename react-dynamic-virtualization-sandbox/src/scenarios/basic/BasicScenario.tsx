import { useMemo, useRef } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./BasicScenario.css"

type BasicScenarioProps = {
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function BasicScenario({
  config,
  onRenderedItemCountChange,
}: BasicScenarioProps) {
  const renderedItems = useRef(new Set<string>())

  const items = useMemo(() => createItems(config.itemCount), [config.itemCount])

  function handleItemRef(itemId: string, element: HTMLDivElement | null) {
    if (element) {
      renderedItems.current.add(itemId)
    } else {
      renderedItems.current.delete(itemId)
    }

    onRenderedItemCountChange(renderedItems.current.size)
  }

  return (
    <div className="basic-scenario">
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <BasicItem
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

type BasicItemProps = {
  item: SandboxItem
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function BasicItem({ item, ref, style }: BasicItemProps) {
  return (
    <div ref={ref} className="basic-item" style={style}>
      <div className="basic-item-content">
        <span className="basic-item-index">#{item.index}</span>
        <span>{item.content}</span>
      </div>
    </div>
  )
}
