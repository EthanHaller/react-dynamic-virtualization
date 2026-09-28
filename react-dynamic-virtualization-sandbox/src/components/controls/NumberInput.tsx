type NumberInputProps = {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  id: string
  onChange: (value: number) => void
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  id,
  onChange,
}: NumberInputProps) {
  return (
    <label className="control" htmlFor={id}>
      <span className="control-label">{label}</span>
      <input
        id={id}
        name={id}
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
