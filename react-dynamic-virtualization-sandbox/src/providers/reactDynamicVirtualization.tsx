import { useCallback, useImperativeHandle, useRef } from "react"
import { VirtualizedList } from "../../../react-dynamic-virtualization/src"
import type { ProviderListProps } from "./types"
import type { SandboxItem } from "../data"
import { useRenderedItemTracking } from "./useRenderedItemTracking"

type RowRenderOptions = {
  ref: (element: HTMLDivElement | null) => void
  style: React.CSSProperties
}

const getItemId = (item: SandboxItem) => item.id

export function ReactDynamicVirtualizationList({ ref, config, items, renderRowBody, getRowPresentation, onRenderedItemCountChange }: ProviderListProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRenderedItem = useRenderedItemTracking(onRenderedItemCountChange)
  useImperativeHandle(ref, () => ({
    scrollToOffset: (offset) => viewportRef.current?.scrollTo({ top: offset, behavior: "instant" }),
    getViewportElement: () => viewportRef.current,
  }), [])

  const renderItem = useCallback((item: SandboxItem, options: RowRenderOptions) => (
    <ReactDynamicVirtualizationRow
      item={item}
      measurementRef={options.ref}
      style={options.style}
      getRowPresentation={getRowPresentation}
      renderRowBody={renderRowBody}
      trackRenderedItem={trackRenderedItem}
    />
  ), [getRowPresentation, renderRowBody, trackRenderedItem])

  return <VirtualizedList
    items={items}
    getItemId={getItemId}
    height={config.listHeight}
    overscan={config.overscan}
    scrollElementRef={viewportRef}
    renderItem={renderItem}
  />
}

function ReactDynamicVirtualizationRow({ item, measurementRef, style, getRowPresentation, renderRowBody, trackRenderedItem }: {
  item: SandboxItem
  measurementRef: RowRenderOptions["ref"]
  style: React.CSSProperties
  getRowPresentation: ProviderListProps["getRowPresentation"]
  renderRowBody: ProviderListProps["renderRowBody"]
  trackRenderedItem: ReturnType<typeof useRenderedItemTracking>
}) {
  const { height, ...rowAttributes } = getRowPresentation(item)
  const attachMeasuredRow = useCallback((element: HTMLDivElement | null) => {
    measurementRef(element)
    trackRenderedItem(item.id, element)
  }, [measurementRef, trackRenderedItem, item.id])

  return <div {...rowAttributes} data-item-id={item.id} data-height={height}
    ref={attachMeasuredRow} style={{ ...style, height }}
  >{renderRowBody(item)}</div>
}
