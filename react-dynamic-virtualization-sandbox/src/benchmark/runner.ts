import {
  DEFAULT_SCROLL_STEPS,
  runScrollSequence,
  type ScrollStep,
} from "./scrolling"

import type { BenchmarkRunResult, BenchmarkScrollController } from "./types"

export const BENCHMARK_START_MARK = "rdv-benchmark-start"
export const BENCHMARK_END_MARK = "rdv-benchmark-end"
export const BENCHMARK_MEASURE = "rdv-benchmark-run"

function clearPreviousMeasurement(): void {
  performance.clearMarks(BENCHMARK_START_MARK)
  performance.clearMarks(BENCHMARK_END_MARK)
  performance.clearMeasures(BENCHMARK_MEASURE)
}

function startMeasurement(): void {
  clearPreviousMeasurement()
  performance.mark(BENCHMARK_START_MARK)
}

function finishMeasurement(): BenchmarkRunResult {
  performance.mark(BENCHMARK_END_MARK)

  const measure = performance.measure(
    BENCHMARK_MEASURE,
    BENCHMARK_START_MARK,
    BENCHMARK_END_MARK,
  )

  return {
    duration: measure.duration,
    startTime: measure.startTime,
    endTime: measure.startTime + measure.duration,
  }
}

export function runBenchmark(
  controller: BenchmarkScrollController,
  steps: ScrollStep[] = DEFAULT_SCROLL_STEPS,
): {
  promise: Promise<BenchmarkRunResult>
  cancel: () => void
} {
  startMeasurement()

  let resolveResult: ((result: BenchmarkRunResult) => void) | undefined

  const promise = new Promise<BenchmarkRunResult>((resolve) => {
    resolveResult = resolve
  })

  const cancelScrolling = runScrollSequence(controller, steps, {
    onComplete: () => {
      resolveResult?.(finishMeasurement())
    },
  })

  return {
    promise,
    cancel: cancelScrolling,
  }
}
