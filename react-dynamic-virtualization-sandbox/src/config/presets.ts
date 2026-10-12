import type { SandboxConfig } from "./types"

export type SandboxPreset = {
  name: string
  description: string
  config: SandboxConfig
}

export const sandboxPresets: SandboxPreset[] = [
  {
    name: "Default",
    description: "Balanced workload for exploring the scenarios.",
    config: {
      itemCount: 20,
      itemSize: 80,
      overscan: 2,
      listHeight: 500,
      enableSizeChanges: true,
      changeInterval: 1_000,
    },
  },
  {
    name: "Large List",
    description: "10,000 items with a small viewport.",
    config: {
      itemCount: 10_000,
      itemSize: 80,
      overscan: 5,
      listHeight: 400,
      enableSizeChanges: false,
      changeInterval: 1_000,
    },
  },
  {
    name: "High Overscan",
    description: "More items rendered around the viewport.",
    config: {
      itemCount: 10_000,
      itemSize: 80,
      overscan: 50,
      listHeight: 500,
      enableSizeChanges: false,
      changeInterval: 1_000,
    },
  },
  {
    name: "Rapid Changes",
    description: "Frequently changing item heights.",
    config: {
      itemCount: 10_000,
      itemSize: 80,
      overscan: 5,
      listHeight: 500,
      enableSizeChanges: true,
      changeInterval: 250,
    },
  },
]
