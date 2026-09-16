type NumberInputProps = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberInputProps) {
  return (
    <label className="control">
      <span className="control-label">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const nextValue = Number(event.target.value)

          if (Number.isFinite(nextValue)) {
            onChange(nextValue)
          }
        }}
      />
    </label>
  )
}
