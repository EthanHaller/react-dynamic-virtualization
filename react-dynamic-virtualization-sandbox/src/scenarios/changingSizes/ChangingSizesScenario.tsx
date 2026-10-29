import type { ScenarioExperimentHandle } from "../types"
import { memo, useImperativeHandle, useMemo, useRef } from "react"
import { ScenarioList } from "../../providers/ScenarioList"
import type { ProviderListHandle } from "../../providers/types"
import type { ChangingHeightsConfig } from "../../config/types"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import { getAdditionalContent, useChangingSizes } from "./useChangingSizes"
import "./ChangingSizesScenario.css"

type ChangingSizesScenarioProps = {
  ref: React.Ref<ScenarioExperimentHandle>
  config: ChangingHeightsConfig
  onRenderedItemCountChange: (count: number) => void
}

export function ChangingSizesScenario({
  ref,
  config,
  onRenderedItemCountChange,
}: ChangingSizesScenarioProps) {
  const providerListRef = useRef<ProviderListHandle>(null)

  const items = useMemo(() => createItems(config.itemCount), [config.itemCount])

  const { expandedItems, resetSizeChanges } = useChangingSizes(
    config.itemCount,
    config.enableSizeChanges,
    config.changeInterval,
  )

  useImperativeHandle(ref, () => ({
    resetExperiment(configuration) {
      resetSizeChanges(configuration)
      providerListRef.current?.scrollToOffset?.(0)
    },
  }), [resetSizeChanges])

  return (
    <div className="changing-sizes-scenario">
      <ScenarioList
        ref={providerListRef}
        items={items}
        config={config}
        onRenderedItemCountChange={onRenderedItemCountChange}
        getRowPresentation={() => ({ className: "changing-size-item" })}
        renderRowBody={(item) => <ChangingSizeItemBody item={item} expanded={expandedItems.has(item.index)} />}
      />
    </div>
  )
}

const ChangingSizeItemBody = memo(function ChangingSizeItemBody({ item, expanded }: { item: SandboxItem; expanded: boolean }) {
  return (
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
  )
})
