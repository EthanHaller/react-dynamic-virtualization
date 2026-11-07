import { useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import { createHeightItems, type HeightItem } from "../../data/createHeightItems"
import "./CustomizationDemo.css"

export const customizationPath = "/customization"

const heightOptions = [
  { label: "Viewport (55dvh)", height: "55dvh" },
  { label: "Resizable flex parent", height: "auto" },
  { label: "Fixed (360px)", height: 360 },
] as const

const items = createHeightItems({ itemCount: 1000, minHeight: 50, maxHeight: 120 })
const getItemId = (item: HeightItem) => item.id

export function CustomizationDemo() {
  const [height, setHeight] = useState<string | number>(heightOptions[0].height)

  return (
    <section className="panel responsive-viewport-demo">
      <h2>Customization</h2>
      <h3>Viewport height</h3>
      <p>Resize the browser for viewport sizing, or drag the flex panel’s resize handle. Switch modes while scrolled to compare them.</p>
      <div role="group" aria-label="Viewport sizing">
        {heightOptions.map((option) => (
          <button
            key={option.height}
            type="button"
            aria-pressed={height === option.height}
            onClick={() => setHeight(option.height)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="responsive-viewport-frame" data-flex={height === "auto"}>
        <VirtualizedList
          items={items}
          getItemId={getItemId}
          height={height}
          renderItem={renderItem}
        />
      </div>
    </section>
  )
}

function renderItem(item: HeightItem, { ref, style }: {
  ref: (element: HTMLDivElement | null) => void
  style: React.CSSProperties
}) {
  return (
    <div ref={ref} className="responsive-viewport-row" style={{ ...style, height: item.height }}>
      Row {item.index + 1} · {item.height}px
    </div>
  )
}
