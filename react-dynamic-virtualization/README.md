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

## Development

```bash
npm install
npm run build
```
