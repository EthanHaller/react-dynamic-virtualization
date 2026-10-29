import { Fragment, createContext, useCallback, useContext, useImperativeHandle, useMemo, useRef } from "react"
import { VList, type VListHandle, type CustomItemComponentProps } from "virtua"
import type { SandboxItem } from "../data"
import type { ProviderListProps } from "./types"
import { useRenderedItemTracking } from "./useRenderedItemTracking"

// Virtua creates the item element. Customize that element instead of adding a row wrapper.
const VirtuaRowContext = createContext<{
  items: ProviderListProps["items"]
  getRowPresentation: ProviderListProps["getRowPresentation"]
  trackRenderedItem: ReturnType<typeof useRenderedItemTracking>
} | null>(null)

function VirtuaRow({ ref, index, style, children }: CustomItemComponentProps) {
  const { items, getRowPresentation, trackRenderedItem } = useContext(VirtuaRowContext)!
  const item = items[index]
  const { height, ...rowAttributes } = getRowPresentation(item)
  const attachMeasuredRow = useCallback((element: HTMLDivElement | null) => {
    const cleanup = typeof ref === "function" ? ref(element) : undefined
    if (ref && typeof ref !== "function") ref.current = element
    trackRenderedItem(item.id, element)
    if (typeof cleanup === "function") return () => {
      cleanup()
      trackRenderedItem(item.id, null)
    }
  }, [ref, trackRenderedItem, item.id])

  return <div
    {...rowAttributes}
    data-item-id={item.id}
    data-height={height}
    ref={attachMeasuredRow}
    style={{ ...style, height }}
  >{children}</div>
}

export function VirtuaList({ ref, config, items, renderRowBody, getRowPresentation, onRenderedItemCountChange }: ProviderListProps) {
  const listRef = useRef<VListHandle>(null)
  const trackRenderedItem = useRenderedItemTracking(onRenderedItemCountChange)
  useImperativeHandle(ref, () => ({
    scrollToOffset: (offset) => listRef.current?.scrollTo(offset),
  }), [])

  const rowContext = useMemo(() => ({ items, getRowPresentation, trackRenderedItem }),
    [items, getRowPresentation, trackRenderedItem])
  const renderItem = useCallback((item: SandboxItem) => (
    <Fragment key={item.id}>{renderRowBody(item)}</Fragment>
  ), [renderRowBody])

  return <VirtuaRowContext value={rowContext}>
    <VList ref={listRef} data={items} item={VirtuaRow} bufferSize={config.bufferSize} style={{ height: config.listHeight }}>
      {renderItem}
    </VList>
  </VirtuaRowContext>
}

