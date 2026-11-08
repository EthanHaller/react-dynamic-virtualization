# react-dynamic-virtualization

A React virtualized list for items whose dimensions can change after they mount.
The library handles measurement, positioning, and the visible range while callers
supply item identity, content, and layout choices. Dynamic item sizing was the
starting point for the design. Expanding content, asynchronous data, and item
reordering should work through the same list API.

- [Library usage and API](react-dynamic-virtualization/README.md)
- [Sandbox scenarios and controls](react-dynamic-virtualization-sandbox/README.md)
- [Dynamic-height benchmark and reproduction steps](react-dynamic-virtualization-sandbox/DYNAMIC_HEIGHT_PERFORMANCE_COMPARISON.md)

## Design decisions

This is a living record of why the project works the way it does. Each entry
records the decision, what it buys us, and the cost or constraint it introduces.
The package README describes the public contract.

### API and layout

The project started with a vertical list and an explicit pixel height. CSS-sized
heights, horizontal orientation, and optional estimates came later, after the
measurement and positioning model was in place. An estimate helps choose the
initial render range while the browser provides the actual size.
[Responsive height PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/51),
[horizontal orientation PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/54),
[item estimates PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/56).


| Decision | Reason and tradeoff |
| --- | --- |
| Expose one `VirtualizedList` for both axes. Require the scroll-axis dimension through orientation-specific props. | The same API covers vertical feeds and horizontal strips. A vertical height can come from CSS and be measured at runtime. A horizontal width is numeric, so a caller with a CSS-sized horizontal panel measures it and supplies the resulting width. |
| Accept item data directly and identify items by stable ID. | Callers supply their records and identity. Indexes describe the current order, while IDs let the store preserve sizes when that order changes. |
| Pass a measurement ref and positioning style through `renderItem`. | A library-owned item wrapper would keep positioning out of the caller's markup but add a DOM element per rendered item. The callback lets the caller choose the item’s HTML element. That element must accept the ref and preserve the positioning styles. Item-specific transforms can go on inner content. |
| Render a window of absolutely positioned items inside a spacer. | The spacer provides the full scroll extent, while each mounted item uses `translateY` or `translateX` to reach its position. Overscan adds a buffer in item counts. A larger buffer mounts more DOM, and a given item count covers a variable distance when sizes differ. |
| Accept a per-item estimate and seed each ID when it enters the list. | The first range needs provisional sizes before any row is mounted. Retained IDs keep their sizes even if the callback changes, so an inline callback can be used without re-estimating existing items. A different estimate takes effect for IDs entering the list afterward. |
| Remount on orientation changes. | Width measurements and horizontal scroll offsets describe a different layout from height measurements and vertical offsets. A remount starts the new axis with fresh measurements and an offset of zero. It also resets local state in rendered items. |

### Positioning and measurement

| Decision | Reason and tradeoff |
| --- | --- |
| Use a Fenwick tree for cumulative item sizes. | An array of absolute positions would need to rewrite all following offsets when an early item resizes. The tree updates cumulative sums and uses those sums to find offsets and indexes. Construction builds the cumulative entries in passes over the items, and the tree keeps a running total. Changes to the ID sequence rebuild the indexed structure from sizes retained by ID. A tree designed for arbitrary insertions and deletions would add complexity to optimize that rebuild. |
| Store measured sizes separately from gap. | The tree receives each item's scroll extent, including its trailing gap where applicable. Changing gap rebuilds offsets from cached sizes, which keeps the tree's operations independent of layout options. The rebuild touches every item, so gap works best as a stable layout setting. Start and end padding are handled outside the tree. |
| Observe mounted items through one shared item observer per list. Observe the viewport only when its scroll-axis size comes from CSS. | Actual row sizes can change over time. Numeric viewport dimensions skip viewport observation, and repeat measurements of the same CSS viewport size skip React updates. CSS sizing depends on the surrounding layout providing a usable viewport size. |
| Keep viewport measurement, item measurement, and position storage behind separate interfaces. | `VirtualizedList` connects the pieces and renders the selected range. Row rendering is memoized so a viewport update can reuse rows whose inputs are stable. Changing a row's content or position still updates that row. |

#### Layout state and React

The initial design kept raw heights in a separate `MeasurementCache`, and
React subscribed to a snapshot that exposed only a version. The render then
queried positions directly from the store. React Compiler could memoize
those separate reads and reuse stale positions even after a measurement
triggered a render. `PositionStore` now owns the size map and the tree, and
the `useSyncExternalStore` snapshot exposes the queries that rendering uses.
A size change updates the layout and publishes a fresh snapshot.
[React Compiler compatibility PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/21).

Keeping the tree outside React state avoids cloning it for each measurement
or updating a separate state value solely to trigger a render. The tradeoff
is that the store owns the notification and snapshot lifecycle. An unchanged
measurement can leave both the snapshot and its subscribers alone.

The store also distinguishes a rerender from a change in item order. When
the item ID array is the same object, the store can reuse it without
scanning IDs on scroll or measurement updates. A replacement array gets a
sequence comparison, and a different sequence rebuilds offsets while
carrying forward sizes by ID. This keeps the common case cheap while
accepting ordinary immutable array updates from callers.
[Store lifecycle PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/27),
[item ID scan PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/48).

The browser reports sizes after layout. An item can expand when its content
loads or changes, so the list observes mounted items throughout their lifetime.
Until a measurement arrives, range selection and scroll extent depend on
estimates. A correction to an earlier item's size can move later items even
when updating the tree is cheap.

### Development and verification

| Decision | Reason and tradeoff |
| --- | --- |
| Keep a separate sandbox that imports the library source. | Contributors can exercise edits immediately and compare providers on shared scenarios. The sandbox uses provider adapters for comparisons and one Customization tab for library-specific props. The package has no dependency on the sandbox. |
| Test the tree, store lifecycle, and component at their own boundaries. | Tree tests exercise cumulative positions and updates directly. Hook tests verify size retention across ID changes. Integration tests use a mocked `ResizeObserver` and group behavior by feature. Browser layout and performance are verified separately. |
| Report performance against a named workload and recorded environment. | Dynamic payload changes and fixed-size scrolling exercise different paths. The existing TanStack comparison documents one deterministic dynamic-height workload, the tested versions, and how to reproduce it. Claims about another version or workload require measurements for that case. |

#### Shareable experiments

Scenario controls are scoped to settings that affect the selected experiment.
The URL records those settings so a reload or shared link can recreate the
initial experiment. Scroll position, drag order, and a partially completed run
stay local to the session. That keeps URLs useful for reproducing the setup
while leaving interaction history to the running demo.
[Scenario controls PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/41),
[URL configuration PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/44).

#### Provider comparisons

The initial benchmark runner jumped to scroll offsets and gave a poor
representation of the work each provider does. The project moved provider
selection into the normal scenario configuration. Comparisons share datasets
and row content, while each adapter owns its provider's positioning,
measurement, and scrolling integration. Browser traces give more detail about
the work at the cost of manual setup and care to keep runs comparable.
[Benchmark runner removal PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/38),
[provider strategies PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/45).

Changing heights uses seeded payload updates in place of random expansion so
providers receive the same sequence. Subscriptions keep those updates local to
the affected records and diagnostics, reducing the work the sandbox itself
introduces into the measurement.
[Deterministic workload PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/49).

#### Package and checks

The package build emits an ES module and TypeScript declarations. The library
and tests have separate TypeScript configurations so test files stay outside
the published build. The GitHub Actions test workflow is currently manual,
and contributors can run the same library checks locally.
[Type declarations PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/20),
[manual workflow PR](https://github.com/EthanHaller/react-dynamic-virtualization/pull/52).

## Repository layout

| Directory | Purpose |
| --- | --- |
| [react-dynamic-virtualization](react-dynamic-virtualization/) | Library source, package documentation, and tests. |
| [react-dynamic-virtualization-sandbox](react-dynamic-virtualization-sandbox/) | Interactive use cases, customization demo, and provider comparisons. |

Run `npm run test:run`, `npm run test:typecheck`, and `npm run build` in the
library directory. Run `npm run dev` in the sandbox directory for interactive
testing, or `npm run build` and `npm run lint` to verify sandbox changes.
