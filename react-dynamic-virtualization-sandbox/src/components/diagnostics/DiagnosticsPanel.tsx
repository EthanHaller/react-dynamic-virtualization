import type { SandboxConfig } from "../../config/types"
import "./DiagnosticsPanel.css"

type DiagnosticsPanelProps = {
  sizing: "fixed" | "variable"
  config: SandboxConfig
  renderedItemCount: number
}

export function DiagnosticsPanel({
  sizing,
  config,
  renderedItemCount,
}: DiagnosticsPanelProps) {
  return (
    <section className="panel diagnostics-panel">
      <div className="panel-header">
        <h2>Diagnostics</h2>
      </div>

      <div className="diagnostics-content">
        <DiagnosticValue label="Items" value={config.itemCount} />
        <DiagnosticValue label="Rendered" value={renderedItemCount} />
        <DiagnosticValue label="Overscan" value={config.overscan} />
        <DiagnosticValue label="List height" value={`${config.listHeight}px`} />
        <DiagnosticValue label="Sizing" value={sizing} />
      </div>
    </section>
  )
}

type DiagnosticValueProps = {
  label: string
  value: string | number
}

function DiagnosticValue({ label, value }: DiagnosticValueProps) {
  return (
    <div className="diagnostic-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
