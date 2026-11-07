import type { ScenarioExperimentHandle } from "../types"
import { useImperativeHandle, useMemo, useRef } from "react"
import { ScenarioList } from "../../providers/ScenarioList"
import type { ProviderListHandle } from "../../providers/types"
import type { InitialHeightsConfig } from "../../config/types"
import { createHeightItems } from "../../data/createHeightItems"
import { createItems } from "../../data"
import type { SandboxItem } from "../../data"
import { SandboxItemBody } from "../../components/SandboxItemBody"
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
          className: "sandbox-item-bounded",
          height: sizing === "fixed" ? config.itemSize : items[item.index].height,
        })}
        renderRowBody={(item) => <SandboxItemBody item={item} />}
      />
    </div>
  )
}
