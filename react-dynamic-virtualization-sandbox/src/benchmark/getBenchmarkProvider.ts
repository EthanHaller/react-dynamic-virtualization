import { benchmarkProviders } from "./providers"
import type { BenchmarkProvider } from "./types"

export function getBenchmarkProvider(providerId: string): BenchmarkProvider {
  const provider = benchmarkProviders.find((item) => item.id === providerId)

  if (!provider) {
    throw new Error(`Unknown benchmark provider: ${providerId}`)
  }

  return provider
}
