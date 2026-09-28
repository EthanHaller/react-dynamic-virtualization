type InfoTooltipProps = {
  content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <span className="info-tooltip">
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-label="More information"
        aria-describedby="info-tooltip-content"
      >
        <span aria-hidden="true">ⓘ</span>
      </button>

      <span
        id="info-tooltip-content"
        role="tooltip"
        className="info-tooltip-content"
      >
        {content}
      </span>
    </span>
  )
}
