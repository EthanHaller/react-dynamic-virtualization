import type { ComponentType, HTMLAttributes, ReactElement, Ref } from "react"
import type { ListConfig } from "../config/types"
import type { SandboxItem } from "../data"
import type { ProviderDefinition } from "./providerDefinitions"

// Appearance and interaction intent, never provider positioning styles or measurement refs.
export type RowPresentation = Pick<HTMLAttributes<HTMLDivElement>,
  "className" | "draggable" | "onDragStart" | "onDragEnd" | "onDragOver" | "onDragLeave" | "onDrop"
> & { height?: number }

export type ProviderListHandle = {
  scrollToOffset?: (offset: number) => void
  getViewportElement?: () => HTMLDivElement | null
}

export type ProviderListProps = {
  ref: Ref<ProviderListHandle>
  config: ListConfig
  items: SandboxItem[]
  renderRowBody: (item: SandboxItem) => ReactElement
  getRowPresentation: (item: SandboxItem) => RowPresentation
  onRenderedItemCountChange: (count: number) => void
}

export type ListProvider = ProviderDefinition & { List: ComponentType<ProviderListProps> }
