export const providerIds = ["react-dynamic-virtualization", "tanstack-virtual", "virtua"] as const
export type ProviderId = (typeof providerIds)[number]

export type ProviderCapabilities = {
  viewportAccess: boolean
  scrolling: boolean
  dynamicSizing: boolean
  mutations: boolean
  dragAndDrop: boolean
}

export type ProviderSetting = {
  field: "overscan" | "estimatedItemHeight" | "bufferSize"
  label: string
  description: string
  min: number
  max: number
}

export type ProviderDefinition = {
  id: ProviderId
  label: string
  capabilities: ProviderCapabilities
  settings: readonly ProviderSetting[]
}

const itemOverscan: ProviderSetting = {
  field: "overscan", label: "Overscan (items)", min: 0, max: 100_000,
  description: "Extra items rendered before and after the visible range.",
}

export const providerDefinitions: readonly ProviderDefinition[] = [
  {
    id: "react-dynamic-virtualization", label: "React Dynamic Virtualization",
    capabilities: { viewportAccess: true, scrolling: true, dynamicSizing: true, mutations: true, dragAndDrop: true },
    settings: [itemOverscan],
  },
  {
    id: "tanstack-virtual", label: "TanStack Virtual",
    capabilities: { viewportAccess: true, scrolling: true, dynamicSizing: true, mutations: true, dragAndDrop: true },
    settings: [itemOverscan, {
      field: "estimatedItemHeight", label: "Estimated item height (px)", min: 1, max: 100_000,
      description: "TanStack's estimate for unmeasured content rows. Explicit scenario heights take precedence.",
    }],
  },
  {
    id: "virtua", label: "Virtua",
    capabilities: { viewportAccess: false, scrolling: true, dynamicSizing: true, mutations: true, dragAndDrop: true },
    settings: [{
      field: "bufferSize", label: "Buffer size (px)", min: 0, max: 100_000,
      description: "Virtua's extra rendered space in pixels. This is not item-count overscan. Item height estimation remains automatic.",
    }],
  },
]

export function getProviderDefinition(providerId: ProviderId): ProviderDefinition {
  return providerDefinitions.find((provider) => provider.id === providerId)!
}

export function parseProviderId(queryValue: string | null): ProviderId {
  return providerIds.find((providerId) => providerId === queryValue) ?? "react-dynamic-virtualization"
}
