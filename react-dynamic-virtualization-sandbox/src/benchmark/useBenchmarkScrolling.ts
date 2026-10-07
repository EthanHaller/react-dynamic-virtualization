import { useEffect } from "react"

import { runScrollSequence } from "./scrolling"

import type { BenchmarkScrollController } from "./types"

type UseBenchmarkScrollingOptions = {
  enabled: boolean
  controller: BenchmarkScrollController | null
}

export function useBenchmarkScrolling({
  enabled,
  controller,
}: UseBenchmarkScrollingOptions): void {
  useEffect(() => {
    if (!enabled || !controller) {
      return
    }

    return runScrollSequence(controller)
  }, [enabled, controller])
}
