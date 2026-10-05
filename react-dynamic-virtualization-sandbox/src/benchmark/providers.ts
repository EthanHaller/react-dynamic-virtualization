import {
  reactDynamicVirtualizationProvider,
  tanstackVirtualProvider,
} from "./providers/index"
import type { BenchmarkProvider } from "./types"

export const benchmarkProviders: BenchmarkProvider[] = [
  reactDynamicVirtualizationProvider,
  tanstackVirtualProvider,
]
