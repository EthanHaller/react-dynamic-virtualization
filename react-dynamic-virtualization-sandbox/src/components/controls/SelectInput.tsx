type SelectOption<T extends string> = {
  label: string
  value: T
}

type SelectInputProps<T extends string> = {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}

export function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectInputProps<T>) {
  return (
    <label className="control">
      <span className="control-label">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value as T)
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
