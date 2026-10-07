import type { BenchmarkScrollController } from "./types"

export type ScrollStep = {
  position: number
  duration: number
}

export const DEFAULT_SCROLL_STEPS: ScrollStep[] = [
  { position: 0, duration: 0 },
  { position: 0.25, duration: 500 },
  { position: 0.5, duration: 500 },
  { position: 0.75, duration: 500 },
  { position: 1, duration: 500 },
  { position: 0.5, duration: 500 },
  { position: 0, duration: 500 },
]

export function runScrollSequence(
  controller: BenchmarkScrollController,
  steps: ScrollStep[] = DEFAULT_SCROLL_STEPS,
): () => void {
  let cancelled = false
  let timeoutId: number | undefined

  const runStep = (index: number) => {
    if (cancelled || index >= steps.length) {
      return
    }

    const step = steps[index]

    controller.scrollTo(step.position)

    timeoutId = window.setTimeout(() => {
      runStep(index + 1)
    }, step.duration)
  }

  runStep(0)

  return () => {
    cancelled = true

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  }
}
