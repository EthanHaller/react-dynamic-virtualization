import type { SandboxConfig } from "../config/types"

export type ScenarioExperimentHandle = {
  startRun?: () => void
  resetExperiment: (configuration: SandboxConfig) => void
}
