import type { SandboxPreset } from "../../config/presets"

type PresetSelectProps = {
  preset: SandboxPreset
  presets: SandboxPreset[]
  onSelect: (preset: SandboxPreset) => void
}

export function PresetSelect({ preset: activePreset, presets, onSelect }: PresetSelectProps) {

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
            onSelect(preset)
          }
        }}
      >
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
