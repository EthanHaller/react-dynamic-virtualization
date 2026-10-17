import type { SandboxConfig } from "../../config/types"
import { InfoTooltip } from "./InfoTooltip"
import { NumberInput } from "./NumberInput"
import type { ScenarioId } from "../../routing/scenarioRoutes"
import { scenarioControls } from "../../config/controlAvailability"
import { sandboxPresets, type SandboxPreset } from "../../config/presets"
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
  resetConfig: () => void
}

export function ConfigurationPanel({
  scenario,
  preset,
  config,
  updateConfig,
  applyPreset,
  resetConfig,
}: ConfigurationPanelProps) {
  return (
    <div className="configuration-content">
      <PresetSelect
        preset={preset}
        presets={sandboxPresets.filter((preset) => scenario === "changing-heights" || preset.name !== "Rapid Changes")}
        onSelect={(preset) => applyPreset(preset)}
      />

      {scenarioControls[scenario].includes("itemCount") && <NumberInput
        id="item-count"
        label={scenario === "mutations-and-reordering" || scenario === "drag-and-drop" ? "Initial items" : "Items"}
        value={config.itemCount}
        min={scenario === "fixed-heights" ? 0 : 1}
        onChange={(value) => updateConfig("itemCount", value)}
      />}

      {scenarioControls[scenario].includes("itemSize") && <NumberInput
        id="item-size"
        label="Item height (px)"
        value={config.itemSize}
        min={1}
        onChange={(value) => updateConfig("itemSize", value)}
      />}

      {scenarioControls[scenario].includes("overscan") && <NumberInput
        id="overscan"
        label="Overscan"
        value={config.overscan}
        min={0}
        onChange={(value) => updateConfig("overscan", value)}
      />}

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

      <button type="button" onClick={resetConfig}>
        Reset
      </button>
    </div>
  )
}
