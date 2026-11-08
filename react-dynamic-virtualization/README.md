# react-dynamic-virtualization

Render large React lists whose items can change size after they mount.

## Install

```bash
npm install react-dynamic-virtualization
```

## Usage

```tsx
import { VirtualizedList } from "react-dynamic-virtualization"

type FeedItem = {
  id: string
  kind: "photo" | "note"
  title: string
}

export function Feed({ items }: { items: FeedItem[] }) {
  return (
    <VirtualizedList
      items={items}
      getItemId={(item) => item.id}
      height="70dvh"
      gap={8}
      paddingStart={16}
      paddingEnd={16}
      className="feed"
      estimateItemSize={(item) => (item.kind === "photo" ? 240 : 64)}
      renderItem={(item, { ref, style }) => (
        <div ref={ref} style={style}>
          {item.title}
        </div>
      )}
    />
  )
}
```

Choose the item’s HTML element, such as a `div` or `article`, and attach the
supplied `ref` and `style` to that same element. If you render a custom React
component, forward both to its outer HTML element. The ref lets the list
measure the item, and the style positions it. Apply decorative
padding and borders to content inside that element so they count toward the
item's measured size.

## VirtualizedList props

`T` is the item type inferred from `items`. The **Default** column indicates
when a prop is required.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `T[]` | Required | Items in render order. |
| `getItemId` | `(item: T) => string` | Required | Returns a stable, unique ID for each item. IDs identify rows and let the list reuse sizes across reorders and insertions. |
| `renderItem` | `(item: T, options: RenderItemOptions) => React.ReactElement` | Required | Renders an item with the provided measurement ref and positioning style. See the shape below. |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Selects the scroll axis. Changing it remounts the viewport and rows, resets scroll position, and takes fresh measurements. |
| `height` | `number \| string` | Required for vertical lists | Viewport height. A number is in pixels. A string is a CSS height. Horizontal lists can take their height from the surrounding layout. |
| `width` | `number` | Required for horizontal lists | Viewport width in pixels. Vertical lists can take their width from the surrounding layout. |
| `overscan` | `number` | `2` | Number of extra items to render on either side of the visible range where available. |
| `gap` | `number` | `0` | Pixels between adjacent items along the scroll axis. |
| `paddingStart` | `number` | `0` | Pixels before the first item along the scroll axis. |
| `paddingEnd` | `number` | `0` | Pixels after the last item along the scroll axis. |
| `className` | `string` | Omitted | CSS class applied to the outer scroll container, including for an empty list. |
| `estimateItemSize` | `(item: T) => number` | `() => 50` | Starting height or width in pixels for an item ID entering the list. Actual measurements take over as items mount and resize. |
| `scrollElementRef` | `React.Ref<HTMLDivElement>` | Omitted | Ref to the outer scroll container, for example to call `scrollTo()`. |

The second argument to `renderItem` has this shape:

```ts
type RenderItemOptions = {
  ref: (element: HTMLElement | null) => void
  style: React.CSSProperties
}
```

### Viewport sizing

For a responsive vertical viewport, pass a CSS height such as `"70dvh"` or
`"calc(100dvh - 64px)"`. The list measures its viewport and updates the
visible range when that height changes. Use `height="auto"` when the surrounding
layout allocates space. For example, in a height-constrained flex column,
apply `flex: 1` and `min-height: 0` to the viewport through `className`.

Horizontal lists start at the left. Pass a numeric `width` and give the viewport
a height through the optional `height` prop or CSS. Each item gets its width
from its content or from styles supplied by the caller.

### Spacing and estimates

Gap and padding accept finite, nonnegative pixel values. The last item has no
trailing gap. Changing `gap` rebuilds offsets from cached item sizes.

Return a finite, positive number from `estimateItemSize`. Keep the callback
pure because React may repeat render work. Changing the callback affects IDs
that enter the list afterward. Retained IDs keep their current sizes.

## Development

```bash
npm install
npm run test:run
npm run build
```
