import type { ScenarioExperimentHandle } from "../types"
import { memo, useImperativeHandle, useMemo, useRef } from "react"
import { ScenarioList } from "../../providers/ScenarioList"
import type { ProviderListHandle } from "../../providers/types"
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
  const providerListRef = useRef<ProviderListHandle>(null)

  const { itemCount, minHeight, maxHeight } = config
  const items = useMemo<(SandboxItem & { height?: number })[]>(() => {
    if (sizing === "fixed") return createItems(itemCount)
    const heightConfig = { itemCount, minHeight, maxHeight }
    return createHeightItems(heightConfig)
  }, [sizing, itemCount, minHeight, maxHeight])

  useImperativeHandle(ref, () => ({
    resetExperiment() {
      providerListRef.current?.scrollToOffset?.(0)
    },
  }), [])

  return (
    <div className="initial-height-scenario">
      <ScenarioList
        ref={providerListRef}
        items={items}
        config={config}
        onRenderedItemCountChange={onRenderedItemCountChange}
        getRowPresentation={(item) => ({
          className: "initial-height-item initial-height-item-fixed",
          height: sizing === "fixed" ? config.itemSize : items[item.index].height,
        })}
        renderRowBody={(item) => <InitialHeightItemBody item={item} />}
      />
    </div>
  )
}

const InitialHeightItemBody = memo(function InitialHeightItemBody({ item }: { item: SandboxItem }) {
  return (
      <div className="initial-height-item-content">
        <span className="initial-height-item-index">#{item.index}</span>
        <span className="initial-height-item-text">{item.content}</span>
      </div>
  )
})
