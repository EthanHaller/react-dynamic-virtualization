import { useSyncExternalStore, type ReactNode } from "react"
import type { RenderedItemCountStore } from "./renderedItemCountStore"
import "./DiagnosticsPanel.css"

type DiagnosticsPanelProps = {
  children?: ReactNode
  renderedItemDiagnostics: RenderedItemCountStore
}

export function DiagnosticsPanel({
  children,
  renderedItemDiagnostics,
}: DiagnosticsPanelProps) {
  const renderedItemCount = useSyncExternalStore(renderedItemDiagnostics.subscribe, renderedItemDiagnostics.getSnapshot)

  return (
    <section className="panel diagnostics-panel">
      <div className="panel-header">
        <h2>Diagnostics</h2>
      </div>

      <div className="diagnostics-content">
        <DiagnosticValue label="Rendered" value={renderedItemCount} />
      </div>
      {children}
    </section>
  )
}

type DiagnosticValueProps = {
  label: string
  value: string | number
}

export function DiagnosticValue({ label, value }: DiagnosticValueProps) {
  return (
    <div className="diagnostic-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
