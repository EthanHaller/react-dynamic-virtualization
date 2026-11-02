import type { ReactNode } from "react"
import { providerDefinitions, getProviderDefinition } from "../../providers/providerDefinitions"
import { getUnsupportedScenarioReason } from "../../providers/providerRegistry"
import type { SandboxConfig } from "../../config/types"
import { NumberInput } from "./NumberInput"
import type { ScenarioId } from "../../routing/scenarioRoutes"
import { getScenarioNumberConstraints, scenarioControls } from "../../config/controlAvailability"
import { getAvailableSandboxPresets, type SandboxPreset } from "../../config/presets"
import { PresetSelect } from "./PresetSelect"

type ConfigurationPanelProps = {
  experimentActions?: ReactNode
  scenario: ScenarioId
  preset: SandboxPreset
  config: SandboxConfig
  updateConfig: <K extends keyof SandboxConfig>(
    key: K,
    value: SandboxConfig[K],
  ) => void
  applyPreset: (preset: SandboxPreset) => void
  resetExperiment: () => void
  restoreDefaultConfig: () => void
}

export function ConfigurationPanel({
  scenario,
  preset,
  config,
  updateConfig,
  applyPreset,
  restoreDefaultConfig,
  resetExperiment,
  experimentActions,
}: ConfigurationPanelProps) {
  return (
    <div className="configuration-content">
      <label className="control" htmlFor="provider">
        <span className="control-label">Virtualization provider</span>
        <select id="provider" value={config.providerId} onChange={(event) => {
          const provider = providerDefinitions.find((provider) => provider.id === event.target.value)
          if (provider && !getUnsupportedScenarioReason(provider.capabilities, scenario)) updateConfig("providerId", provider.id)
        }}>
          {providerDefinitions.map((provider) => {
            const unsupportedReason = getUnsupportedScenarioReason(provider.capabilities, scenario)
            return <option key={provider.id} value={provider.id} disabled={!!unsupportedReason}>
              {provider.label}{unsupportedReason ? ` — ${unsupportedReason}` : ""}
            </option>
          })}
        </select>
      </label>
      <PresetSelect
        preset={preset}
        presets={[...(preset.name === "Custom" ? [preset] : []), ...getAvailableSandboxPresets(scenario, config.providerId)]}
        onSelect={(preset) => applyPreset(preset)}
      />

      {experimentActions}

      {scenarioControls[scenario].includes("itemCount") && <NumberInput
        id="item-count"
        label={scenario === "mutations-and-reordering" || scenario === "drag-and-drop" ? "Initial items" : "Items"}
        value={config.itemCount}
        {...getScenarioNumberConstraints(scenario, "itemCount")}
        onChange={(value) => updateConfig("itemCount", value)}
      />}

      {([ ["minHeight", "Minimum height (px)"], ["maxHeight", "Maximum height (px)"] ] as const).map(([key, label]) => scenarioControls[scenario].includes(key) && (
        <NumberInput key={key} id={key} label={label} value={config[key]} {...getScenarioNumberConstraints(scenario, key)} onChange={(value) => updateConfig(key, value)} />
      ))}

      {scenarioControls[scenario].includes("itemSize") && <NumberInput
        id="item-size"
        label="Item height (px)"
        value={config.itemSize}
        {...getScenarioNumberConstraints(scenario, "itemSize")}
        onChange={(value) => updateConfig("itemSize", value)}
      />}

      {getProviderDefinition(config.providerId).settings.map((setting) => <div key={setting.field}>
        <NumberInput
          id={setting.field}
          label={setting.label}
          value={config[setting.field]}
          min={setting.min}
          max={setting.max}
          onChange={(value) => updateConfig(setting.field, value)}
        />
        <span className="control-description">{setting.description}</span>
      </div>)}

      {scenarioControls[scenario].includes("listHeight") && <NumberInput
        id="list-height"
        label="List height (px)"
        value={config.listHeight}
        {...getScenarioNumberConstraints(scenario, "listHeight")}
        onChange={(value) => updateConfig("listHeight", value)}
      />}

      {scenarioControls[scenario].includes("workloadSeed") && <div>
        <NumberInput
          id="workload-seed"
          label="Payload seed"
          value={config.workloadSeed}
          {...getScenarioNumberConstraints(scenario, "workloadSeed")}
          onChange={(value) => updateConfig("workloadSeed", value)}
        />
        <span className="control-description">The same seed repeats the same payload changes across providers.</span>
      </div>}
      {scenarioControls[scenario].includes("payloadUpdateBatchSize") && <NumberInput
        id="payload-batch-size"
        label="Rows to update"
        value={config.payloadUpdateBatchSize}
        {...getScenarioNumberConstraints(scenario, "payloadUpdateBatchSize")}
        onChange={(value) => updateConfig("payloadUpdateBatchSize", value)}
      />}
      {scenarioControls[scenario].includes("payloadUpdateInterval") && <NumberInput
        id="payload-update-interval"
        label="Requested update interval (ms)"
        value={config.payloadUpdateInterval}
        {...getScenarioNumberConstraints(scenario, "payloadUpdateInterval")}
        onChange={(value) => updateConfig("payloadUpdateInterval", value)}
      />}

      <button type="button" onClick={resetExperiment}>Reset experiment</button>
      <button type="button" onClick={restoreDefaultConfig}>Restore defaults</button>
    </div>
  )
}
