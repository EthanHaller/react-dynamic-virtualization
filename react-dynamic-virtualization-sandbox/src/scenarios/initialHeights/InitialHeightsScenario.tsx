import type { ScenarioExperimentHandle } from "../types"
import { useImperativeHandle, useCallback, useMemo, useRef } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import type { InitialHeightsConfig } from "../../config/types"
import { createHeightItems } from "../../data/createHeightItems"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import "./InitialHeightsScenario.css"

type InitialHeightsScenarioProps = {
  ref: React.Ref<ScenarioExperimentHandle>
  sizing: "fixed" | "variable"
  config: InitialHeightsConfig
  onRenderedItemCountChange: (count: number) => void
}

export function InitialHeightsScenario({
  ref,
  sizing,
  config,
  onRenderedItemCountChange,
}: InitialHeightsScenarioProps) {
  const renderedItems = useRef(new Set<string>())
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const { itemCount, minHeight, maxHeight } = config
  const items = useMemo<(SandboxItem & { height?: number })[]>(() => {
    if (sizing === "fixed") return createItems(itemCount)
    const heightConfig = { itemCount, minHeight, maxHeight }
    return createHeightItems(heightConfig)
  }, [sizing, itemCount, minHeight, maxHeight])

  useImperativeHandle(ref, () => ({
    resetExperiment() {
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
    <div className="initial-height-scenario">
      <VirtualizedList
        scrollElementRef={scrollElementRef}
        items={items}
        getItemId={(item) => item.id}
        height={config.listHeight}
        overscan={config.overscan}
        renderItem={(item, { ref, style }) => (
          <InitialHeightItem
            item={item}
            height={sizing === "fixed" ? config.itemSize : item.height}
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
    <div ref={ref} data-item-id={item.id} data-height={height} className={`initial-height-item${height === undefined ? "" : " initial-height-item-fixed"}`} style={{ ...style, height }}>
      <div className="initial-height-item-content">
        <span className="initial-height-item-index">#{item.index}</span>
        <span className="initial-height-item-text">{item.content}</span>
      </div>
    </div>
  )
}
