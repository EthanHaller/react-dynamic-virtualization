# Dynamic-height performance comparison

The published React Dynamic Virtualization `1.1.0` package used **48% less
main-thread task time** and **72% less JavaScript time** than TanStack Virtual
in the unthrottled Changing heights workload. Both providers completed the
same 200 updates at essentially the same pace.

## Workload

The sandbox's **Changing heights** scenario renders 100,000 event records. The
first four rows repeatedly expand and collapse their payload details while the
records retain their identities and order. Each run uses seed 1 and applies
200 updates at a requested interval of 100ms.

Both providers use the same row content, overscan of two items, and a 600px-tall
list viewport with 1,022px content width. TanStack uses its existing 80px height
estimate. The first four rows stay mounted and visible throughout the comparison.

## Published 1.1.0 verification

The table reports means across 10 measured runs per provider at normal CPU
speed. One warm-up run per provider was excluded, and provider order
alternated between pairs. RDV used less main-thread and JavaScript time in
every measured pair.

| Mean per run | RDV 1.1.0 | TanStack Virtual 3.14.13 |
| --- | ---: | ---: |
| Main-thread task time | 1,143 ms | 2,186 ms |
| JavaScript time | 366 ms | 1,294 ms |
| Time to complete 200 updates | 20.415 s | 20.417 s |

The production sandbox ran in headless Chrome 156.0.8078.80 on macOS 15.5
arm64 at a browser viewport of 1,368 × 950 CSS pixels. It used React 19.2.8
and TanStack virtual-core 3.17.11. **Use local build** was off, so the RDV
provider loaded the published npm package.

Main-thread task time and JavaScript time are deltas from Chrome DevTools
Protocol's `Performance.getMetrics` counters `TaskDuration` and
`ScriptDuration`. Counters were sampled just before **Start run** and roughly
500 ms after completion was detected. Completion time comes from the
workload's start and end marks. This run uses counter means, while the
original comparison below uses trace medians. Compare providers within
each method.

## Original trace results

The original trace runs showed **50–55% less main-thread task time** and
**70–72% less JavaScript execution time** for RDV. At 20× CPU slowdown, RDV
completed the same 200 updates **28% sooner**.

The table reports median times. Each provider receives one warm-up run before
measurement, and provider order alternates between pairs.

| CPU setting | Measured runs per provider | Main-thread task time: RDV / TanStack | JavaScript time: RDV / TanStack | Completion time: RDV / TanStack |
| --- | ---: | ---: | ---: | ---: |
| Normal | 5 | **0.621s / 1.245s** | **0.228s / 0.752s** | 20.036s / 20.036s |
| 4× slowdown | 5 | **2.391s / 5.000s** | **0.919s / 3.148s** | 20.111s / 20.120s |
| 20× slowdown | 2 | **12.920s / 28.494s** | **5.052s / 18.156s** | **20.613s / 28.507s** |

At normal speed and 4× slowdown, both providers sustain the requested update
cadence. RDV's lower processing cost provides more main-thread headroom. At
20× slowdown, that headroom also produces a higher update rate.

## Measurement breakdown

The following values are medians across the measured runs. Long-task counts show
how many main-thread tasks exceeded 50ms in each run.

| CPU setting | Provider | JavaScript | Rendering | Painting | Garbage collection | Long tasks per run | Updates per second |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | RDV | 0.228s | 0.127s | 0.039s | 0.033s | 0 | 9.98 |
| Normal | TanStack | 0.752s | 0.171s | 0.058s | 0.048s | 0 | 9.98 |
| 4× slowdown | RDV | 0.919s | 0.541s | 0.163s | 0.060s | 0 | 9.94 |
| 4× slowdown | TanStack | 3.148s | 0.688s | 0.251s | 0.122s | 0 | 9.94 |
| 20× slowdown | RDV | 5.052s | 3.088s | 0.902s | 0.274s | 44–56 | 9.70 |
| 20× slowdown | TanStack | 18.156s | 3.976s | 1.429s | 0.536s | 203–205 | 7.02 |

Rendering and painting measurements cover the renderer's main thread. At 20×
slowdown, RDV completed the workload with fewer long tasks and a higher update rate.

## Reproduce the original trace comparison

1. Run `npm run build` and `npm run preview` from the sandbox directory.
2. Open `/changing?itemCount=100000&payloadUpdateBatchSize=4` and select a provider.
3. Keep the first four rows visible and record Chrome's Performance panel while
   running **Start run**. Repeat with the other provider using the same settings.

These recordings used a production build with source maps in a private Chrome
156.0.8078.79 window on macOS 15.5 arm64. The build used React 19.2.8,
TanStack React Virtual 3.14.13, and virtual-core 3.17.11.

Main-thread task time sums Chrome's renderer `RunTask` durations from the start
mark through 500ms after the final dispatch, including the final measurement,
layout, and paint. JavaScript time counts callback execution with nested rendering,
painting, and garbage collection excluded. Completion time measures the run from
its start mark through its final update dispatch.
