import type { ScenarioId } from "../routing/scenarioRoutes"
import { providerDefinitions, type ProviderCapabilities, type ProviderId } from "./providerDefinitions"
import { ReactDynamicVirtualizationList } from "./reactDynamicVirtualization"
import { TanstackVirtualList } from "./tanstackVirtual"
import { VirtuaList } from "./virtua"
import type { ListProvider } from "./types"

const providerComponents = {
  "react-dynamic-virtualization": ReactDynamicVirtualizationList,
  "tanstack-virtual": TanstackVirtualList,
  virtua: VirtuaList,
}

export const listProviders: readonly ListProvider[] = providerDefinitions.map((definition) => ({
  ...definition, List: providerComponents[definition.id],
}))

export function getListProvider(providerId: ProviderId): ListProvider {
  return listProviders.find((provider) => provider.id === providerId)!
}

export function getUnsupportedScenarioReason(capabilities: ProviderCapabilities, scenario: ScenarioId): string | undefined {
  if (!capabilities.scrolling) return "This provider cannot reset the list scroll position."
  if ((scenario === "variable-initial-heights" || scenario === "changing-heights") && !capabilities.dynamicSizing) return "This provider does not support dynamic row measurement."
  if (scenario === "mutations-and-reordering" && !capabilities.mutations) return "This provider does not support list mutations and reordering."
  if (scenario === "drag-and-drop" && (!capabilities.mutations || !capabilities.dragAndDrop)) return "This provider does not support drag and drop reordering."
}
