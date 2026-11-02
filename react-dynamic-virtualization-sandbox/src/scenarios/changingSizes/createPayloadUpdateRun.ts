import type { ChangingHeightsConfig } from "../../config/types"
import {
  createPayloadWorkload,
  payloadUpdateBatchCount,
  type PayloadUpdateBatch,
  type RecordPayloadLines,
} from "./createPayloadWorkload"

type RunDiagnostics = {
  status: "Ready" | "Running" | "Stopped" | "Completed"
  appliedBatchCount: number
  elapsedMilliseconds: number
  dispatchIntervalsMilliseconds: readonly number[]
}

const emptyPayloadLines: RecordPayloadLines = []
const initialRunDiagnostics: RunDiagnostics = {
  status: "Ready",
  appliedBatchCount: 0,
  elapsedMilliseconds: 0,
  dispatchIntervalsMilliseconds: [],
}

// Separate subscriptions keep timer updates out of the scenario and configuration panel.
export function createPayloadUpdateRun() {
  const diagnosticSubscribers = new Set<() => void>()
  const recordSubscribers = new Map<number, Set<() => void>>()
  const timingMarkNames: string[] = []
  let recordPayloads: PayloadUpdateBatch = []
  let pendingBatchTimer: ReturnType<typeof setTimeout> | undefined
  let timingRunSequence = 0
  let runStartedAt = 0
  let activeRunTimingPrefix = ""
  let runDiagnostics = initialRunDiagnostics

  function recordTimingMark(name: string) {
    performance.mark(name)
    timingMarkNames.push(name)
  }

  function publishRunDiagnostics() {
    diagnosticSubscribers.forEach((subscriber) => subscriber())
  }

  function updateRecordPayloads(nextPayloads: PayloadUpdateBatch) {
    const affectedRecordCount = Math.max(recordPayloads.length, nextPayloads.length)
    recordPayloads = nextPayloads

    for (let recordIndex = 0; recordIndex < affectedRecordCount; recordIndex++) {
      recordSubscribers.get(recordIndex)?.forEach((subscriber) => subscriber())
    }
  }

  function stopRun() {
    clearTimeout(pendingBatchTimer)
    pendingBatchTimer = undefined

    if (runDiagnostics.status !== "Running") return

    recordTimingMark(`${activeRunTimingPrefix}:end`)
    runDiagnostics = {
      ...runDiagnostics,
      status: "Stopped",
      elapsedMilliseconds: performance.now() - runStartedAt,
    }
    publishRunDiagnostics()
  }

  function resetExperiment() {
    stopRun()
    updateRecordPayloads([])
    runDiagnostics = initialRunDiagnostics
    publishRunDiagnostics()
  }

  function startRun(config: ChangingHeightsConfig) {
    resetExperiment()
    const payloadBatches = createPayloadWorkload(config.workloadSeed, config.payloadUpdateBatchSize)

    timingRunSequence++
    activeRunTimingPrefix = `payload-updates:${config.providerId}:${timingRunSequence}`
    timingMarkNames.forEach((name) => performance.clearMarks(name))
    timingMarkNames.length = 0

    // Preparing the sequence must not count toward the measured run duration.
    recordTimingMark(`${activeRunTimingPrefix}:start`)
    runStartedAt = performance.now()
    let previousBatchDispatchedAt = runStartedAt
    runDiagnostics = { ...initialRunDiagnostics, status: "Running" }
    publishRunDiagnostics()

    function dispatchNextBatch() {
      const batchDispatchedAt = performance.now()
      const batchIndex = runDiagnostics.appliedBatchCount
      recordTimingMark(`${activeRunTimingPrefix}:batch:${batchIndex + 1}`)
      updateRecordPayloads(payloadBatches[batchIndex])

      runDiagnostics = {
        status: batchIndex + 1 === payloadUpdateBatchCount ? "Completed" : "Running",
        appliedBatchCount: batchIndex + 1,
        elapsedMilliseconds: batchDispatchedAt - runStartedAt,
        dispatchIntervalsMilliseconds: [
          ...runDiagnostics.dispatchIntervalsMilliseconds,
          batchDispatchedAt - previousBatchDispatchedAt,
        ],
      }
      previousBatchDispatchedAt = batchDispatchedAt
      publishRunDiagnostics()

      if (runDiagnostics.status === "Completed") {
        pendingBatchTimer = undefined
        recordTimingMark(`${activeRunTimingPrefix}:end`)
        return
      }

      // Late updates slow the run instead of producing a burst of catch-up updates.
      pendingBatchTimer = setTimeout(dispatchNextBatch, config.payloadUpdateInterval)
    }

    pendingBatchTimer = setTimeout(dispatchNextBatch, config.payloadUpdateInterval)
  }

  return {
    startRun,
    stopRun,
    resetExperiment,
    getRunDiagnostics: () => runDiagnostics,
    subscribeToRunDiagnostics(subscriber: () => void) {
      diagnosticSubscribers.add(subscriber)
      return () => { diagnosticSubscribers.delete(subscriber) }
    },
    getRecordPayload: (recordIndex: number) => recordPayloads[recordIndex] ?? emptyPayloadLines,
    subscribeToRecord(recordIndex: number, subscriber: () => void) {
      let recordListeners = recordSubscribers.get(recordIndex)
      if (!recordListeners) {
        recordListeners = new Set()
        recordSubscribers.set(recordIndex, recordListeners)
      }

      recordListeners.add(subscriber)
      return () => {
        recordListeners.delete(subscriber)
        if (!recordListeners.size) recordSubscribers.delete(recordIndex)
      }
    },
  }
}

export type PayloadUpdateRun = ReturnType<typeof createPayloadUpdateRun>
