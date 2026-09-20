import { useMemo } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { SandboxConfig } from "../../config/types"
import { createItemSizes, createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./BasicScenario.css"

type BasicScenarioProps = {
  config: SandboxConfig
}

export function BasicScenario({ config }: BasicScenarioProps) {
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

  return (
    <div className="basic-scenario">
      <VirtualizedList
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <BasicItem
            key={item.id}
            item={item}
            height={itemSizes[item.index]}
            ref={ref}
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
