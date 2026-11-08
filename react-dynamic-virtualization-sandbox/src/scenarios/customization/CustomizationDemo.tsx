import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { VirtualizedList } from "../../../../react-dynamic-virtualization/src"
import { SandboxItemBody } from "../../components/SandboxItemBody"
import { NumberInput } from "../../components/controls/NumberInput"
import { SelectInput } from "../../components/controls/SelectInput"
import { createHeightItems } from "../../data/createHeightItems"
import "./CustomizationDemo.css"

export const customizationPath = "/customization"

type Orientation = "vertical" | "horizontal"
type SizingMode = "responsive" | "panel" | "fixed"

const orientationOptions: { label: string; value: Orientation }[] = [
  { label: "Vertical", value: "vertical" },
  { label: "Horizontal", value: "horizontal" },
]

const spacingControls = [
  { prop: "gap", label: "Item gap" },
  { prop: "paddingStart", label: "Start padding" },
  { prop: "paddingEnd", label: "End padding" },
] as const

const viewportStyles = [
  { label: "Default", value: "default" },
  { label: "Outline", value: "outline" },
] as const

const viewportHeights = { responsive: "55dvh", panel: "auto", fixed: 360 } as const
const items = createHeightItems({ itemCount: 1000, minHeight: 50, maxHeight: 120 })
type DemoItem = (typeof items)[number]
const getItemId = (item: DemoItem) => item.id

export function CustomizationDemo() {
  const [orientation, setOrientation] = useState<Orientation>("vertical")
  const [sizingMode, setSizingMode] = useState<SizingMode>("responsive")
  const [spacing, setSpacing] = useState({ gap: 0, paddingStart: 0, paddingEnd: 0 })
  const [viewportStyle, setViewportStyle] = useState<"default" | "outline">("default")
  const frameRef = useRef<HTMLDivElement>(null)
  const [frameWidth, setFrameWidth] = useState(0)

  useLayoutEffect(() => {
    if (orientation !== "horizontal") {
      return
    }

    const frame = frameRef.current!
    const measureWidth = () => setFrameWidth(frame.clientWidth)
    const observer = new ResizeObserver(measureWidth)
    observer.observe(frame)
    measureWidth()

    return () => observer.disconnect()
  }, [orientation])

  // The browser writes inline dimensions when the resize handle is dragged.
  function clearPanelSize() {
    frameRef.current?.style.removeProperty("width")
    frameRef.current?.style.removeProperty("height")
  }

  const scrollDimension = orientation === "horizontal" ? "width" : "height"
  const sizingOptions: { label: string; value: SizingMode }[] = [
    {
      label: orientation === "horizontal" ? "Fit available width" : "Follow browser height",
      value: "responsive",
    },
    { label: "Fill resizable panel", value: "panel" },
    { label: `Fixed ${scrollDimension}`, value: "fixed" },
  ]
  const viewportDimensions = orientation === "horizontal"
    ? { orientation, width: frameWidth, height: sizingMode === "panel" ? "auto" : 120 }
    : { orientation, height: viewportHeights[sizingMode] }

  const renderItem = useCallback((item: DemoItem, { ref, style }: {
    ref: (element: HTMLDivElement | null) => void
    style: React.CSSProperties
  }) => (
    <div
      ref={ref}
      className={orientation === "horizontal"
        ? "sandbox-item-bounded customization-horizontal-item"
        : "sandbox-item-bounded"}
      style={orientation === "horizontal"
        ? { ...style, height: "100%" }
        : { ...style, height: item.height }}
    >
      <SandboxItemBody item={item} />
    </div>
  ), [orientation])

  return (
    <div className="experiment-layout">
      <section className="panel experiment-panel">
        <div className="panel-header"><h2>Experiment</h2></div>
        <div className="customization-demo">
          <div
            ref={frameRef}
            className="customization-viewport"
            data-sizing={sizingMode}
            data-orientation={orientation}
          >
            <VirtualizedList
              {...viewportDimensions}
              {...spacing}
              className={viewportStyle === "outline" ? "customization-viewport-outline" : undefined}
              items={items}
              getItemId={getItemId}
              renderItem={renderItem}
            />
          </div>
        </div>
      </section>
      <aside className="panel configuration-panel">
        <div className="panel-header"><h2>Configuration</h2></div>
        <div className="configuration-content">
          <SelectInput
            id="customization-orientation"
            label="Orientation"
            value={orientation}
            options={orientationOptions}
            onChange={(value) => {
              clearPanelSize()
              setOrientation(value)
            }}
          />
          <SelectInput
            id="customization-viewport-sizing"
            label={orientation === "horizontal" ? "Viewport width" : "Viewport height"}
            value={sizingMode}
            options={sizingOptions}
            onChange={(value) => {
              clearPanelSize()
              setSizingMode(value)
            }}
          />
          {sizingMode === "panel" && (
            <p className="control-description">Drag the panel’s corner to resize it.</p>
          )}
          {spacingControls.map(({ prop, label }) => (
            <NumberInput
              key={prop}
              id={`customization-${prop}`}
              label={label}
              min={0}
              value={spacing[prop]}
              onChange={(value) => setSpacing({ ...spacing, [prop]: Math.max(0, value) })}
            />
          ))}
          <SelectInput
            id="customization-viewport-style"
            label="Viewport style"
            value={viewportStyle}
            options={[...viewportStyles]}
            onChange={setViewportStyle}
          />
        </div>
      </aside>
    </div>
  )
}
