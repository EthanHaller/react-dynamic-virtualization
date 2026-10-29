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

The scenario identity selects the sizing model.

Switching scenarios starts a new experiment. Changing the configured item count resets the current experiment in place. List edits and scroll position reset; other configuration changes preserve interaction state.

## Scenario routes

Open `/fixed`, `/variable`, `/changing`, `/mutations`, or `/drag-and-drop` directly. `/` redirects to `/fixed` while retaining its query string and fragment. Unknown paths show an explanation and links to valid scenarios. React Router handles route matching and browser history. Navigation uses native links with `aria-current="page"`; ordinary clicks use browser history, and modified clicks retain native browser behavior.

Vite's default SPA fallback serves these paths in both `npm run dev` and `npm run preview` (after `npm run build`). A deployed static host must likewise serve `index.html` for scenario paths.

## Scenario configuration

The preset selector reflects matching configuration, or Custom for other values.
Changing the initial item count recreates that scenario's list. Other configuration
changes preserve its current item order. Switching scenarios mounts a new experiment.

| Field | Availability | Implemented effect |
| --- | --- | --- |
| `itemCount` | All scenarios | Creates the list; labeled Initial items for mutation/reordering scenarios |
| `overscan` | All scenarios with React Dynamic Virtualization or TanStack Virtual | Adds rendered items around the viewport |
| `listHeight` | All scenarios | Sets the scroll viewport height in pixels |
| `itemSize` | Fixed heights | Sets each row's border-box height in pixels |
| `enableSizeChanges` | Changing heights | Starts/pauses random expansion updates; pausing retains current heights |
| `changeInterval` | Changing heights, while updates are enabled | Sets update frequency in milliseconds |
| `itemSizing` | Removed | Route already determines sizing; the field was unwired |
| `minItemSize`, `maxItemSize` | Removed | No scenario consumed these fields |

The explicit allowlists in `src/config/controlAvailability.ts` govern scenario controls;
the provider registry governs provider-specific controls. Scenario props use narrow configuration types. New controls
must be opted into their owning scenarios. Rapid Changes is offered only in Changing
heights; the unwired Extreme Sizes preset has been removed.

### Variable initial heights

At `/variable`, item count, minimum/maximum height, overscan, and viewport
height are editable. The default inclusive height bounds are 50–300 CSS pixels. Heights follow a fixed repeating pattern of 32 positions within that range,
defined in `src/data/createHeightItems.ts` and rounded to integer pixels. Equal bounds produce constant heights. The height inputs advertise a 50–300px range. Valid integer values apply immediately while editing. Invalid values fall back to defaults.

The provider-independent `createHeightItems` function associates each height
with `item-N`. The scenario memoizes the dataset by count and bounds;
viewport or overscan changes do not regenerate it. Scrolling/remounting reads
stored heights. Rows use border-box sizing and clip overflowing content. The list
fills its container width, like the other scenarios. No automatic resizing is involved.

For manual browser geometry checks, compare row heights before and after scrolling
away and back. Setting both bounds to 80 should produce 80px rows. Height inputs can be edited independently, including temporarily inverted bounds,
without an error state.

### Shareable experiments

The URL persists configuration for the selected scenario, so reloading or opening it
in another tab recreates the initial experiment. Default values are omitted; invalid
values fall back to defaults. Switching scenarios removes irrelevant parameters.
Control edits replace the current history entry; back and forward restore configuration.

**Reset experiment** recreates the initial experiment using the current configuration.
**Restore defaults** replaces configuration with scenario defaults and resets the experiment.
Transient state such as scroll position, list edits, and dragging is not persisted.

## Virtualization strategies

The sandbox uses the strategy pattern: scenarios own datasets, row bodies, sizing
state, and actions; `src/providers` selects a virtualization strategy by stable ID.
Each adapter owns its native wrappers, keys, measurement refs, positioning, and
scroll integration. Adapters reuse the visual row body without requiring identical
DOM structures or adding abstraction-only wrappers. The virtualization library
remains entirely separate and unchanged.

React Dynamic Virtualization, TanStack Virtual, and Virtua support all five scenarios.
The registry declares capabilities explicitly; unsupported combinations are disabled
with a reason. Viewport DOM access is optional (Virtua exposes scrolling through its
native handle instead). Rendered-item diagnostics count mounted logical rows,
including each provider's overscan or buffer, using the same instrumentation. Row
bodies are memoized independently of provider positioning. Count changes notify only
the diagnostics panel, leaving scenario state and controls out of scroll updates.

| Provider | Settings |
| --- | --- |
| React Dynamic Virtualization | Item-count overscan |
| TanStack Virtual | Item-count overscan; estimated height for unmeasured content rows |
| Virtua | Pixel buffer; native automatic height estimation |

These settings retain their native meanings and are not normalized as equivalent
performance knobs. For example, `?provider=virtua&bufferSize=400` selects Virtua with
a 400px buffer. Only the selected provider's settings persist in the URL; unknown
provider IDs fall back to React Dynamic Virtualization. Presets preserve provider
selection. Switching providers recreates scenario runtime state while keeping the
configuration controls mounted; Restore defaults restores the default provider too.
