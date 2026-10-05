import type { ReactElement, ReactNode } from "react"
import type { SandboxItem } from "../data"

export type BenchmarkRenderItem = (item: SandboxItem) => ReactElement

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
