import { memo } from "react"
import type { SandboxItem } from "../data"
import "./SandboxItemBody.css"

export const SandboxItemBody = memo(function SandboxItemBody({ item }: { item: SandboxItem }) {
  return (
    <div className="sandbox-item-content">
      <span className="sandbox-item-index">#{item.index}</span>
      <span className="sandbox-item-text">{item.content}</span>
    </div>
  )
})
