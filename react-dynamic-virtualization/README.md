# react-dynamic-virtualization

React list virtualization for items whose size can change over time.

## Install

```bash
npm install react-dynamic-virtualization
```

Peer dependency: React 18 or later.

## Viewport height

Pass a number to set the viewport height in pixels, or a CSS height string such
as `"70dvh"` or `"calc(100dvh - 64px)"`. For CSS heights, the list measures
its viewport and updates the visible rows when that height changes.

Use `height="auto"` when the surrounding layout allocates the height. For
example, inside a height-constrained flex column, give the list viewport
`flex: 1` and `min-height: 0` through a parent CSS selector.

## Orientation

Lists scroll vertically by default and require a `height`. For a horizontal
list, pass `orientation="horizontal"` and a numeric `width`. Give the viewport
a height through the optional `height` prop or the surrounding CSS layout.
Each horizontal item supplies its own width through its content or styling.
Attach the provided ref and positioning style to the same item element.

Horizontal scrolling starts at the left. Changing orientation remounts the
viewport and its rows, resets the scroll offset, and takes fresh measurements.

## Spacing and viewport styling

Use `gap` for space between items, `paddingStart` for space before the first
item, and `paddingEnd` for space after the last item. All three default to
`0` and accept nonnegative pixel values along the scroll axis. The final item
has no trailing gap. Changing `gap` rebuilds item offsets from cached
measurements, so set it as a layout value. Pass `className` to style the outer
scroll container.

## Item size estimates

Pass `estimateItemSize={(item) => item.kind === "photo" ? 240 : 64}` to give
each item a starting size in pixels. The estimate is a height for vertical
lists and a width for horizontal lists. Return a finite, positive number.
Without a callback, items start at 50 px.

The list uses the callback when an item ID enters the list. Retained IDs keep
their current sizes when the callback changes. Measured sizes take over as
items mount and continue to update as they resize. Keep the callback pure so
React can safely repeat render work.

## Development

```bash
npm install
npm run build
```
