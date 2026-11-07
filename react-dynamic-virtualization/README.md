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

## Development

```bash
npm install
npm run build
```
