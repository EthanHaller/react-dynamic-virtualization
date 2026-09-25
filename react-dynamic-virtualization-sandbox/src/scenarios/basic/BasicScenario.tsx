import { useMemo, useRef } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItemSizes, createItems } from "../../data"
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

  const itemSizes = useMemo(
    () =>
      createItemSizes({
        count: config.itemCount,
        sizing: config.itemSizing,
        fixedSize: config.itemSize,
        minSize: config.minItemSize,
        maxSize: config.maxItemSize,
      }),
    [
      config.itemCount,
      config.itemSizing,
      config.itemSize,
      config.minItemSize,
      config.maxItemSize,
    ],
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
    <div className="basic-scenario">
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <BasicItem
            item={item}
            height={itemSizes[item.index]}
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
  height: number
  ref: React.Ref<HTMLDivElement>
  style: React.CSSProperties
}

function BasicItem({ item, height, ref, style }: BasicItemProps) {
  return (
    <div
      ref={ref}
      className="basic-item"
      style={{
        ...style,
        height,
      }}
    >
      <div className="basic-item-content">
        <span className="basic-item-index">#{item.index}</span>
        <span>{item.content}</span>
      </div>
    </div>
  )
}
