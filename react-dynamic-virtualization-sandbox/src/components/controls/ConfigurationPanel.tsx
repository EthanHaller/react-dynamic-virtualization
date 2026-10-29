import { providerDefinitions, getProviderDefinition } from "../../providers/providerDefinitions"
import { getUnsupportedScenarioReason } from "../../providers/providerRegistry"
import type { SandboxConfig } from "../../config/types"
import { InfoTooltip } from "./InfoTooltip"
import { NumberInput } from "./NumberInput"
import type { ScenarioId } from "../../routing/scenarioRoutes"
import { scenarioControls } from "../../config/controlAvailability"
import { getAvailableSandboxPresets, type SandboxPreset } from "../../config/presets"
import { PresetSelect } from "./PresetSelect"

type ConfigurationPanelProps = {
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

      {scenarioControls[scenario].includes("itemCount") && <NumberInput
        id="item-count"
        label={scenario === "mutations-and-reordering" || scenario === "drag-and-drop" ? "Initial items" : "Items"}
        value={config.itemCount}
        min={scenario === "fixed-heights" || scenario === "variable-initial-heights" ? 0 : 1}
        onChange={(value) => updateConfig("itemCount", value)}
      />}

      {([ ["minHeight", "Minimum height (px)", 50, 300], ["maxHeight", "Maximum height (px)", 50, 300] ] as const).map(([key, label, min, max]) => scenarioControls[scenario].includes(key) && (
        <NumberInput key={key} id={key} label={label} value={config[key]} min={min} max={max} onChange={(value) => updateConfig(key, value)} />
      ))}

      {scenarioControls[scenario].includes("itemSize") && <NumberInput
        id="item-size"
        label="Item height (px)"
        value={config.itemSize}
        min={1}
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
        min={100}
        onChange={(value) => updateConfig("listHeight", value)}
      />}

      {scenarioControls[scenario].includes("changeInterval") && config.enableSizeChanges && <NumberInput
        id="change-interval"
        label="Change interval (ms)"
        value={config.changeInterval}
        min={100}
        step={100}
        onChange={(value) => updateConfig("changeInterval", value)}
      />}

      {scenarioControls[scenario].includes("enableSizeChanges") && <label className="control control-checkbox" htmlFor="enable-size-changes">
        <input
          id="enable-size-changes"
          name="enable-size-changes"
          type="checkbox"
          checked={config.enableSizeChanges}
          onChange={(event) =>
            updateConfig("enableSizeChanges", event.target.checked)
          }
        />

        <span className="control-label">Automatic size changes</span>

        <InfoTooltip content="Selects half the items to expand at each interval. Turning this off pauses changes and keeps the current heights." />
      </label>}

      <button type="button" onClick={resetExperiment}>Reset experiment</button>
      <button type="button" onClick={restoreDefaultConfig}>Restore defaults</button>
    </div>
  )
}
