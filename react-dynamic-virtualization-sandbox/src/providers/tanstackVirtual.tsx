import { useCallback, useImperativeHandle, useRef } from "react"
import { useVirtualizer, type VirtualItem, type Virtualizer } from "@tanstack/react-virtual"
import type { ProviderListProps } from "./types"
import type { SandboxItem } from "../data"
import { useRenderedItemTracking } from "./useRenderedItemTracking"

export function TanstackVirtualList({ ref, config, items, renderRowBody, getRowPresentation, onRenderedItemCountChange }: ProviderListProps) {
  "use no memo" // TanStack exposes mutable virtualizer methods; keep its native subscription rendering.

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRenderedItem = useRenderedItemTracking(onRenderedItemCountChange)
  const getItemKey = useCallback((index: number) => items[index].id, [items])
  const estimateSize = useCallback((index: number) => getRowPresentation(items[index]).height ?? config.estimatedItemHeight,
    [items, getRowPresentation, config.estimatedItemHeight])
  // The component opts out of compilation above; these mutable methods stay inside this adapter.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => viewportRef.current,
    getItemKey,
    estimateSize,
    overscan: config.overscan,
  })
  useImperativeHandle(ref, () => ({
    scrollToOffset: (offset) => virtualizer.scrollToOffset(offset),
    getViewportElement: () => viewportRef.current,
  }), [virtualizer])

  return <div ref={viewportRef} style={{ height: config.listHeight, overflowY: "auto" }}>
    <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <TanstackVirtualRow
          key={virtualRow.key}
          virtualRow={virtualRow}
          virtualizer={virtualizer}
          item={items[virtualRow.index]}
          getRowPresentation={getRowPresentation}
          renderRowBody={renderRowBody}
          trackRenderedItem={trackRenderedItem}
        />
      ))}
    </div>
  </div>
}

function TanstackVirtualRow({ virtualRow, virtualizer, item, getRowPresentation, renderRowBody, trackRenderedItem }: {
  virtualRow: VirtualItem
  virtualizer: Virtualizer<HTMLDivElement, Element>
  item: SandboxItem
  getRowPresentation: ProviderListProps["getRowPresentation"]
  renderRowBody: ProviderListProps["renderRowBody"]
  trackRenderedItem: ReturnType<typeof useRenderedItemTracking>
}) {
  const { height, ...rowAttributes } = getRowPresentation(item)
  const attachMeasuredRow = useCallback((element: HTMLDivElement | null) => {
    virtualizer.measureElement(element)
    trackRenderedItem(item.id, element)
  }, [virtualizer, trackRenderedItem, item.id])

  return <div
    {...rowAttributes}
    data-item-id={item.id}
    data-height={height}
    data-index={virtualRow.index}
    ref={attachMeasuredRow}
    style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualRow.start}px)`, height }}
  >{renderRowBody(item)}</div>
}
