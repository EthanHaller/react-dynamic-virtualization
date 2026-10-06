import {
  reactDynamicVirtualizationProvider,
  tanstackVirtualProvider,
  virtuaProvider,
} from "./providers/index"
import type { BenchmarkProvider } from "./types"

export const benchmarkProviders: BenchmarkProvider[] = [
  reactDynamicVirtualizationProvider,
  tanstackVirtualProvider,
  virtuaProvider,
]
