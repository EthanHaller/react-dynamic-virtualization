import type { SandboxConfig } from "../../config/types"
import { InfoTooltip } from "./InfoTooltip"
import { NumberInput } from "./NumberInput"
import { SelectInput } from "./SelectInput"

type ConfigurationPanelProps = {
  config: SandboxConfig
  updateConfig: <K extends keyof SandboxConfig>(
    key: K,
    value: SandboxConfig[K],
  ) => void
  resetConfig: () => void
}

export function ConfigurationPanel({
  config,
  updateConfig,
  resetConfig,
}: ConfigurationPanelProps) {
  return (
    <div className="configuration-content">
      <NumberInput
        id="item-count"
        label="Items"
        value={config.itemCount}
        min={1}
        onChange={(value) => updateConfig("itemCount", value)}
      />

      <SelectInput
        id="item-sizing"
        label="Sizing"
        value={config.itemSizing}
        options={[
          { label: "Fixed", value: "fixed" },
          { label: "Variable", value: "variable" },
        ]}
        onChange={(value) => updateConfig("itemSizing", value)}
      />

      <NumberInput
        id="overscan"
        label="Overscan"
        value={config.overscan}
        min={0}
        onChange={(value) => updateConfig("overscan", value)}
      />

      <NumberInput
        id="list-height"
        label="List height"
        value={config.listHeight}
        min={100}
        onChange={(value) => updateConfig("listHeight", value)}
      />

      <NumberInput
        id="change-interval"
        label="Change interval"
        value={config.changeInterval}
        min={100}
        step={100}
        onChange={(value) => updateConfig("changeInterval", value)}
      />

      <label className="control control-checkbox" htmlFor="enable-size-changes">
        <input
          id="enable-size-changes"
          name="enable-size-changes"
          type="checkbox"
          checked={config.enableSizeChanges}
          onChange={(event) =>
            updateConfig("enableSizeChanges", event.target.checked)
          }
        />

        <span className="control-label">Size changes</span>

        <InfoTooltip content="Randomly expands and collapses about half of the items at the configured interval." />
      </label>

      <button type="button" onClick={resetConfig}>
        Reset
      </button>
    </div>
  )
}
