import { useEffect, useState } from "react"

import { runBenchmark } from "./runner"

import type { BenchmarkRunResult, BenchmarkScrollController } from "./types"

type BenchmarkRunState = {
  status: "idle" | "running" | "complete"
  result: BenchmarkRunResult | null
}

type UseBenchmarkRunnerOptions = {
  enabled: boolean
  controller: BenchmarkScrollController | null
}

export function useBenchmarkRunner({
  enabled,
  controller,
}: UseBenchmarkRunnerOptions): BenchmarkRunState {
  const [state, setState] = useState<BenchmarkRunState>({
    status: "idle",
    result: null,
  })

  useEffect(() => {
    if (!enabled || !controller) {
      return
    }

    const run = runBenchmark(controller)

    setState({
      status: "running",
      result: null,
    })

    let cancelled = false

    run.promise.then((result) => {
      if (cancelled) {
        return
      }

      setState({
        status: "complete",
        result,
      })
    })

    return () => {
      cancelled = true
      run.cancel()
    }
  }, [enabled, controller])

  return state
}
