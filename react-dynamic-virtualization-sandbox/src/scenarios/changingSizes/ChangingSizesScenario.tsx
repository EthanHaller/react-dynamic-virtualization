import { memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useSyncExternalStore } from "react"
import type { ChangingHeightsConfig } from "../../config/types"
import { createEventItems, type EventItem } from "../../data/createEventItems"
import { ScenarioList } from "../../providers/ScenarioList"
import type { ProviderListHandle } from "../../providers/types"
import type { ScenarioExperimentHandle } from "../types"
import { payloadUpdateBatchCount } from "./createPayloadWorkload"
import type { PayloadUpdateRun } from "./createPayloadUpdateRun"
import "./ChangingSizesScenario.css"

type ChangingSizesScenarioProps = {
  ref: React.Ref<ScenarioExperimentHandle>
  config: ChangingHeightsConfig
  payloadUpdateRun: PayloadUpdateRun
  onRenderedItemCountChange: (count: number) => void
}

export function ChangingSizesScenario({
  ref,
  config,
  payloadUpdateRun,
  onRenderedItemCountChange,
}: ChangingSizesScenarioProps) {
  const providerListRef = useRef<ProviderListHandle>(null)
  const items = useMemo(() => createEventItems(config.itemCount), [config.itemCount])

  const resetExperiment = useCallback(() => {
    payloadUpdateRun.resetExperiment()
    providerListRef.current?.scrollToOffset?.(0)
  }, [payloadUpdateRun])

  useImperativeHandle(ref, () => ({
    resetExperiment,
    startRun() {
      providerListRef.current?.scrollToOffset?.(0)
      payloadUpdateRun.startRun(config)
    },
  }), [resetExperiment, payloadUpdateRun, config])

  useEffect(() => {
    resetExperiment()
    return payloadUpdateRun.stopRun
  }, [payloadUpdateRun, resetExperiment, config.itemCount, config.workloadSeed, config.payloadUpdateBatchSize, config.payloadUpdateInterval])

  return (
    <div className="changing-sizes-scenario">
      <div className="changing-sizes-help">
        <strong>Compare providers when content near the top changes height.</strong>
        <p>
          Start run expands and collapses payload details in the {config.payloadUpdateBatchSize === 1 ? "first row" : `first ${config.payloadUpdateBatchSize} rows`}
          {" "}every {config.payloadUpdateInterval}ms for {payloadUpdateBatchCount} updates.
          Watch the rows below stay aligned as the payloads grow and shrink.
        </p>
      </div>

      <ScenarioList
        ref={providerListRef}
        items={items}
        config={config}
        onRenderedItemCountChange={onRenderedItemCountChange}
        getRowPresentation={() => ({ className: "live-event-row" })}
        renderRowBody={(item) => (
          <EventRecordBody
            item={items[item.index]}
            payloadUpdateRun={payloadUpdateRun}
            receivesPayloadUpdates={item.index < config.payloadUpdateBatchSize}
          />
        )}
      />
    </div>
  )
}

type EventRecordBodyProps = {
  item: EventItem
  payloadUpdateRun: PayloadUpdateRun
  receivesPayloadUpdates: boolean
}

const EventRecordBody = memo(function EventRecordBody({
  item,
  payloadUpdateRun,
  receivesPayloadUpdates,
}: EventRecordBodyProps) {
  const subscribeToPayload = useCallback(
    (subscriber: () => void) => payloadUpdateRun.subscribeToRecord(item.index, subscriber),
    [payloadUpdateRun, item.index],
  )
  const getPayloadSnapshot = useCallback(
    () => payloadUpdateRun.getRecordPayload(item.index),
    [payloadUpdateRun, item.index],
  )
  const payload = useSyncExternalStore(subscribeToPayload, getPayloadSnapshot)

  return (
    <article className="live-event-body">
      <div className="live-event-heading">
        <time dateTime={item.timestamp}>{item.timestamp.slice(11, 19)}</time>
        <span>{item.severity}</span>
        <span>#{item.index}</span>
        {receivesPayloadUpdates && <span className="live-event-payload-state">
          {payload.length > 0 ? "Expanded payload" : "Compact payload"}
        </span>}
      </div>
      <div>{item.content}</div>
      {payload.length > 0 && <div className="live-event-payload">
        {payload.map((line, index) => <div key={index}>{line}</div>)}
      </div>}
    </article>
  )
})
