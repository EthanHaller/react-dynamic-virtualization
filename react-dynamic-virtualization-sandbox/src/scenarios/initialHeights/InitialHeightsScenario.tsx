import { useCallback, useMemo, useRef } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./InitialHeightsScenario.css"

type InitialHeightsScenarioProps = {
  sizing: "fixed" | "variable"
  config: SandboxConfig
  onRenderedItemCountChange: (count: number) => void
}

export function InitialHeightsScenario({
  sizing,
  config,
  onRenderedItemCountChange,
}: InitialHeightsScenarioProps) {
  const renderedItems = useRef(new Set<string>())

  const items = useMemo(() => createItems(config.itemCount), [config.itemCount])

  const handleItemRef = useCallback((itemId: string, element: HTMLDivElement | null) => {
    if (element) {
      renderedItems.current.add(itemId)
    } else {
      renderedItems.current.delete(itemId)
    }

    onRenderedItemCountChange(renderedItems.current.size)
  }, [onRenderedItemCountChange])

  return (
    <div className="initial-height-scenario">
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <InitialHeightItem
            item={item}
            height={sizing === "fixed" ? config.itemSize : undefined}
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

type InitialHeightItemProps = {
  item: SandboxItem
  height?: number
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function InitialHeightItem({ item, height, ref, style }: InitialHeightItemProps) {
  return (
    <div ref={ref} className="initial-height-item" style={{ ...style, height }}>
      <div className="initial-height-item-content">
        <span className="initial-height-item-index">#{item.index}</span>
        <span>{item.content}</span>
      </div>
    </div>
  )
}
