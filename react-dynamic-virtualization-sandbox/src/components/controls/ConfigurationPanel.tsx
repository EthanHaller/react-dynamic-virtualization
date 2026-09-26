import type { SandboxConfig } from "../../config/types"
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
        label="Items"
        value={config.itemCount}
        min={1}
        onChange={(value) => updateConfig("itemCount", value)}
      />

      <SelectInput
        label="Sizing"
        value={config.itemSizing}
        options={[
          { label: "Fixed", value: "fixed" },
          { label: "Variable", value: "variable" },
        ]}
        onChange={(value) => updateConfig("itemSizing", value)}
      />

      <NumberInput
        label="Overscan"
        value={config.overscan}
        min={0}
        onChange={(value) => updateConfig("overscan", value)}
      />

      <NumberInput
        label="List height"
        value={config.listHeight}
        min={100}
        onChange={(value) => updateConfig("listHeight", value)}
      />

      <button type="button" onClick={resetConfig}>
        Reset
      </button>
    </div>
  )
}
