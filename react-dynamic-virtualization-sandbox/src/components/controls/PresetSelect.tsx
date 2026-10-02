import { useState } from "react"
import type { SandboxPreset } from "../../config/presets"

type PresetSelectProps = {
  presets: SandboxPreset[]
  onSelect: (preset: SandboxPreset) => void
}

export function PresetSelect({ presets, onSelect }: PresetSelectProps) {
  const [activePreset, setActivePreset] = useState<SandboxPreset>(presets[0])

  return (
    <label className="control">
      <span className="control-label">Preset</span>

      <select
        value={activePreset.name}
        onChange={(event) => {
          const preset = presets.find(
            (item) => item.name === event.target.value,
          )

          if (preset) {
            setActivePreset(preset)
            onSelect(preset)
          }
        }}
      >
        <option value="" disabled>
          Select preset
        </option>

        {presets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>

      <span className="control-description">Choose a predefined workload.</span>
    </label>
  )
}
