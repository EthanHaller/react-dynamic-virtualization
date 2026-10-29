import { useSyncExternalStore } from "react"
import type { RenderedItemCountStore } from "./renderedItemCountStore"
import { getProviderDefinition } from "../../providers/providerDefinitions"
import type { SandboxConfig } from "../../config/types"
import "./DiagnosticsPanel.css"

type DiagnosticsPanelProps = {
  sizing: "fixed" | "variable"
  config: SandboxConfig
  renderedItemDiagnostics: RenderedItemCountStore
}

export function DiagnosticsPanel({
  sizing,
  config,
  renderedItemDiagnostics,
}: DiagnosticsPanelProps) {
  const renderedItemCount = useSyncExternalStore(renderedItemDiagnostics.subscribe, renderedItemDiagnostics.getSnapshot)

  return (
    <section className="panel diagnostics-panel">
      <div className="panel-header">
        <h2>Diagnostics</h2>
      </div>

      <div className="diagnostics-content">
        <DiagnosticValue label="Items" value={config.itemCount} />
        <DiagnosticValue label="Rendered" value={renderedItemCount} />
        <DiagnosticValue label="Provider" value={getProviderDefinition(config.providerId).label} />
        {getProviderDefinition(config.providerId).settings.map((setting) => (
          <DiagnosticValue key={setting.field} label={setting.label} value={config[setting.field]} />
        ))}
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
