import type { SandboxConfig } from "../config/types"

export type ScenarioExperimentHandle = {
  resetExperiment: (configuration: SandboxConfig) => void
}
