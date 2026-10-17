# React Dynamic Virtualization sandbox

Run `npm install`, then `npm run dev` using a Node version supported by Vite 8 (Node 22.12+). Run `npm run build` and `npm run lint` to verify changes.

## Dependency direction

The sandbox may import from the library. The library must have no knowledge of
or dependency on the sandbox, including in its tests and test configuration.
Do not extend the library's test suite to include sandbox code or broaden its
test configuration to accommodate sandbox imports.

## Scenario implementation

The five scenarios use stable identifiers independently of their display labels:

- `fixed-heights`: Fixed heights. Rows use the configured item size and clip overflowing content.
- `variable-initial-heights`: Variable initial heights. Rows use stable heights from a fixed repeating pattern scaled to the configured bounds.
- `changing-heights`: Changing heights. Retains timed content expansion, controlled by the size-change toggle and interval.
- `mutations-and-reordering`: Mutations and reordering. Add, remove, move first to end, move last to front, reverse, shuffle, and reset act on the same list. Reset restores the configured initial items and next insertion index.
- `drag-and-drop`: Drag and drop. Retains native dragging onto another row to reorder.

The scenario identity selects the sizing model; the shared item-sizing selector does not override it. Wiring that selector to scenario-aware configuration remains unfinished. Query parameters are retained during scenario navigation but are not interpreted as configuration.

Switching scenarios or changing the configured item count remounts the experiment and its rendered-item diagnostics. Configuration persists, while list edits and scroll position reset. Other configuration changes update the current experiment in place.

## Scenario routes

Open `/fixed`, `/variable`, `/changing`, `/mutations`, or `/drag-and-drop` directly. `/` redirects to `/fixed` while retaining its query string and fragment. Unknown paths show an explanation and links to valid scenarios. React Router handles route matching and browser history. Navigation uses native links with `aria-current="page"`; ordinary clicks use browser history, and modified clicks retain native browser behavior.

Vite's default SPA fallback serves these paths in both `npm run dev` and `npm run preview` (after `npm run build`). A deployed static host must likewise serve `index.html` for scenario paths.

## Scenario configuration

Configuration and the selected reset preset are stored separately for each scenario.
Changing the initial item count recreates that scenario's list. Other configuration
changes preserve its current item order. Navigation still remounts the experiment.

| Field | Availability | Implemented effect |
| --- | --- | --- |
| `itemCount` | All scenarios | Creates the list; labeled Initial items for mutation/reordering scenarios |
| `overscan` | All scenarios | Adds rendered items around the viewport |
| `listHeight` | All scenarios | Sets the scroll viewport height in pixels |
| `itemSize` | Fixed heights | Sets each row's border-box height in pixels |
| `enableSizeChanges` | Changing heights | Starts/pauses random expansion updates; pausing retains current heights |
| `changeInterval` | Changing heights, while updates are enabled | Sets update frequency in milliseconds |
| `itemSizing` | Removed | Route already determines sizing; the field was unwired |
| `minItemSize`, `maxItemSize` | Removed | No scenario consumed these fields |

The explicit allowlists in `src/config/controlAvailability.ts` govern rendering and
configuration updates. Scenario props use narrow configuration types. New controls
must be opted into their owning scenarios. Rapid Changes is offered only in Changing
heights; the unwired Extreme Sizes preset has been removed. Reset restores the active
scenario's selected preset.

### Variable initial heights

At `/variable`, item count, minimum/maximum height, overscan, and viewport
height are editable. The default inclusive height bounds are 50–300 CSS pixels. Heights follow a fixed repeating pattern of 32 positions within that range,
defined in `src/data/createHeightItems.ts` and rounded to integer pixels. Equal bounds produce constant heights. The height inputs advertise a 50–300px range. Finite values apply immediately
while editing, without strict validation or an error state.

The provider-independent `createHeightItems` function associates each height
with `item-N`. The scenario memoizes the dataset by count and bounds;
viewport or overscan changes do not regenerate it. Scrolling/remounting reads
stored heights. Rows use border-box sizing and clip overflowing content. The list
fills its container width, like the other scenarios. No automatic resizing is involved.

For manual browser geometry checks, compare row heights before and after scrolling
away and back. Setting both bounds to 80 should produce 80px rows. Height inputs can be edited independently, including temporarily inverted bounds,
without an error state.
