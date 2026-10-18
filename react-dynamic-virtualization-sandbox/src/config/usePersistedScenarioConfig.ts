import { useLocation, useNavigate } from "react-router"
import type { ScenarioId } from "../routing/scenarioRoutes"
import { parseScenarioConfig, serializeScenarioConfig } from "./scenarioQuery"
import type { SandboxConfig } from "./types"

export function usePersistedScenarioConfig(scenario: ScenarioId) {
  const location = useLocation()
  const navigate = useNavigate()
  const config = parseScenarioConfig(scenario, location.search)

  function persistScenarioConfig(updatedConfig: SandboxConfig) {
    void navigate({
      pathname: location.pathname,
      search: serializeScenarioConfig(scenario, updatedConfig),
      hash: location.hash,
    }, { replace: true })
  }

  return { config, persistScenarioConfig }
}
