# Single-row expansion benchmark

React Dynamic Virtualization 1.1.0 used **10–12% less JavaScript execution time**
than TanStack Virtual when expanding the first row of a synthetic list. This
experiment measures one click per trial. The
[scheduled-update stress test](../../DYNAMIC_HEIGHT_PERFORMANCE_COMPARISON.md)
measures a separate workload.

| List items | Measured trials per provider | RDV mean | TanStack mean | Less JavaScript time |
| ---: | ---: | ---: | ---: | ---: |
| 200 | 40 | 3.658 ms | 4.168 ms | 12.2% |
| 500 | 80 | 3.811 ms | 4.246 ms | 10.2% |
| 1,000 | 40 | 3.686 ms | 4.196 ms | 12.2% |

The percentages use `1 − RDV mean / TanStack mean` before rounding. The
absolute differences range from 0.43 to 0.51 ms.

The production sandbox used the published RDV 1.1.0 package, React 19.2.8,
TanStack React Virtual 3.14.13, and TanStack virtual-core 3.17.11. The fixture
used headless Chrome 157.0.8103.40 on macOS, a 1,368 × 1,050 browser viewport,
and 4× CPU slowdown. The Changing heights scenario used seed 1, a batch size
of one, a 600 px list viewport, overscan of two, and a 50 px item size estimate.

Each trial loaded a fresh page. The runner verified the provider and item
count, confirmed **Use local build** was off, and clicked **Expand payloads**
once. It verified that only the first row expanded and that the second row
aligned with it. JavaScript execution time is the change in Chrome DevTools
Protocol's `ScriptDuration` counter from just before the click to 200 ms after
input dispatch completed.

Two sessions interleaved 200- and 500-item lists, and two sessions interleaved
500- and 1,000-item lists. Each session alternated provider order across
pairs, with 20 measured pairs and one excluded warm-up pair per list size.

## Repeat the interaction manually

Build and preview the sandbox, then open
`/changing?itemCount=1000&payloadUpdateBatchSize=1&estimatedItemHeight=50`.
Keep **Use local build** off and select the provider. Record a Chrome
Performance trace at 4× CPU slowdown while clicking **Expand payloads** once.
Reload for a fresh trial and repeat with the other provider. Use `itemCount=200`
or `itemCount=500` to try the other list sizes.

The table reports automated counter measurements from a temporary fixture.
The manual steps reproduce the interaction in the current sandbox.
