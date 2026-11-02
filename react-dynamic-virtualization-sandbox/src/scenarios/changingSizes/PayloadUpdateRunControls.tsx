import { useSyncExternalStore } from "react"
import { DiagnosticValue } from "../../components/diagnostics/DiagnosticsPanel"
import { payloadUpdateBatchCount } from "./createPayloadWorkload"
import type { PayloadUpdateRun } from "./createPayloadUpdateRun"

type PayloadUpdateRunControlsProps = {
  payloadUpdateRun: PayloadUpdateRun
  startRun: () => void
}

export function PayloadUpdateRunControls({ payloadUpdateRun, startRun }: PayloadUpdateRunControlsProps) {
  const runStatus = useSyncExternalStore(
    payloadUpdateRun.subscribeToRunDiagnostics,
    () => payloadUpdateRun.getRunDiagnostics().status,
  )

  return (
    <div className="payload-update-controls">
      <button type="button" onClick={startRun}>Start run</button>
      <button
        type="button"
        className="payload-update-stop"
        onClick={payloadUpdateRun.stopRun}
        disabled={runStatus !== "Running"}
      >
        Stop run
      </button>
      <p className="control-description">
        Start resets the list. Stop keeps the current payloads for inspection.
        Keep the changing rows visible when comparing providers.
      </p>
    </div>
  )
}

type PayloadUpdateRunDiagnosticsProps = {
  payloadUpdateRun: PayloadUpdateRun
}

export function PayloadUpdateRunDiagnostics({ payloadUpdateRun }: PayloadUpdateRunDiagnosticsProps) {
  const runDiagnostics = useSyncExternalStore(
    payloadUpdateRun.subscribeToRunDiagnostics,
    payloadUpdateRun.getRunDiagnostics,
  )
  const updateIntervals = runDiagnostics.dispatchIntervalsMilliseconds
  const averageUpdateIntervalMilliseconds = updateIntervals.length
    ? updateIntervals.reduce((total, interval) => total + interval, 0) / updateIntervals.length
    : 0
  const longestUpdateIntervalMilliseconds = Math.max(0, ...updateIntervals)
  const actualUpdatesPerSecond = averageUpdateIntervalMilliseconds > 0
    ? 1000 / averageUpdateIntervalMilliseconds
    : 0

  return (
    <>
      <div className="diagnostics-content" aria-label="Payload run diagnostics">
        <DiagnosticValue label="Run status" value={runDiagnostics.status} />
        <DiagnosticValue label="Updates" value={`${runDiagnostics.appliedBatchCount}/${payloadUpdateBatchCount}`} />
        <DiagnosticValue label="Run duration" value={`${runDiagnostics.elapsedMilliseconds.toFixed(0)}ms`} />
        <DiagnosticValue label="Average update interval" value={`${averageUpdateIntervalMilliseconds.toFixed(1)}ms`} />
        <DiagnosticValue label="Longest update interval" value={`${longestUpdateIntervalMilliseconds.toFixed(1)}ms`} />
        <DiagnosticValue label="Actual updates/s" value={actualUpdatesPerSecond.toFixed(1)} />
      </div>
      <p className="payload-run-timing-note">
        Update intervals describe cadence. Use a browser Performance recording to measure CPU work.
      </p>
    </>
  )
}
