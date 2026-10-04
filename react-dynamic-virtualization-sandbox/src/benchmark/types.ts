import type { CSSProperties, ReactNode, Ref, ReactElement } from "react"
import type { SandboxItem } from "../data"

export type BenchmarkRenderItem = (
  item: SandboxItem,
  options: {
    ref: Ref<HTMLDivElement>
    style: CSSProperties
  },
) => ReactElement

export type BenchmarkListProps = {
  items: SandboxItem[]
  height: number
  overscan: number
  renderItem: BenchmarkRenderItem
}

export type BenchmarkProvider = {
  id: string
  name: string
  description: string
  List: (props: BenchmarkListProps) => ReactNode
}
