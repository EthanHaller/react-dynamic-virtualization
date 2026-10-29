import type { ProviderId } from "../providers/providerDefinitions"

export type SandboxConfig = {
  providerId: ProviderId
  estimatedItemHeight: number
  bufferSize: number
  minHeight: number
  maxHeight: number
  itemCount: number
  itemSize: number
  overscan: number
  listHeight: number
  enableSizeChanges: boolean
  changeInterval: number
}

export type ListConfig = Pick<SandboxConfig, "itemCount" | "overscan" | "listHeight" | "providerId" | "estimatedItemHeight" | "bufferSize">
export type InitialHeightsConfig = ListConfig & Pick<SandboxConfig, "itemSize" | "minHeight" | "maxHeight">
export type ChangingHeightsConfig = ListConfig & Pick<SandboxConfig, "enableSizeChanges" | "changeInterval">
