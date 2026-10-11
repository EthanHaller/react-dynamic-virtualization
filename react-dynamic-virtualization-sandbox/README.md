# React Dynamic Virtualization sandbox

Run `npm install`, then `npm run dev` using a Node version supported by Vite 8 (Node 22.12+). Run `npm run build` and `npm run lint` to verify changes.

## Scenario implementation

The five scenarios use stable identifiers independently of their display labels:

- `fixed-heights`: Fixed heights. Rows use the configured item size and clip overflowing content.
- `variable-initial-heights`: Variable initial heights. Rows use their natural content height, measured by the virtualized list. Applying the configured minimum/maximum size range is unfinished; the list remains functional using content-driven variation.
- `changing-heights`: Changing heights. Retains timed content expansion, controlled by the size-change toggle and interval.
- `mutations-and-reordering`: Mutations and reordering. Add, remove, move first to end, move last to front, reverse, shuffle, and reset act on the same list. Reset restores the configured initial items and next insertion index.
- `drag-and-drop`: Drag and drop. Retains native dragging onto another row to reorder.

The scenario identity selects the sizing model; the shared item-sizing selector does not override it. Wiring that selector to scenario-aware configuration remains unfinished. No routes, URL configuration, providers, or benchmark execution are added.

Switching scenarios or changing the configured item count remounts the experiment and its rendered-item diagnostics. Configuration persists, while list edits and scroll position reset. Other configuration changes update the current experiment in place.
