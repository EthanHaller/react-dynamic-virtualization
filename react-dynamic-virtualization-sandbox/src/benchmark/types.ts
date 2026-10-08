import type { ReactElement, ReactNode } from "react"

import type { SandboxItem } from "../data"

export type BenchmarkRenderItem = (item: SandboxItem) => ReactElement

export type BenchmarkScrollController = {
  scrollTo: (position: number) => void
}

export type BenchmarkListProps = {
  items: SandboxItem[]
  height: number
  overscan: number
  renderItem: BenchmarkRenderItem
  onScrollController: (controller: BenchmarkScrollController | null) => void
}

export type BenchmarkProvider = {
  id: string
  name: string
  description: string
  List: (props: BenchmarkListProps) => ReactNode
}

export type BenchmarkRunResult = {
  duration: number
  startTime: number
  endTime: number
}
