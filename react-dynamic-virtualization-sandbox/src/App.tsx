import "./App.css"
import { parseScenarioConfig, serializeScenarioConfig } from "./config/scenarioQuery"
import { useLayoutEffect, useRef, useState } from "react"
import { scenarios, type ScenarioId } from "./routing/scenarioRoutes"
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigationType } from "react-router"
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel"
import { ConfigurationPanel } from "./components/controls/ConfigurationPanel"
import { useSandboxConfig } from "./config/useSandboxConfig"
import { defaultConfig } from "./config/defaultConfig"
import type { ScenarioExperimentHandle } from "./scenarios/types"
import { InitialHeightsScenario } from "./scenarios/initialHeights/InitialHeightsScenario"
import { ChangingSizesScenario } from "./scenarios/changingSizes/ChangingSizesScenario"
import { MutationsScenario } from "./scenarios/mutations/MutationsScenario"
import { DragAndDropScenario } from "./scenarios/dragAndDrop/DragAndDropScenario"

function App() {
  const { pathname, search, hash } = useLocation()
  const activeScenario = scenarios.find((scenario) => scenario.path === pathname)?.id ?? "fixed-heights"
  const sandboxConfiguration = useSandboxConfig(activeScenario)

  return (
    <div className="app">
      <header className="app-header">
        <h1>React Dynamic Virtualization</h1>
        <a
          href="https://github.com/EthanHaller/react-dynamic-virtualization"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </header>

      <main className="app-main">
        <nav className="scenario-nav" aria-label="Scenarios">
          {scenarios.map((scenario) => (
            <NavLink
              key={scenario.id}
              to={`${scenario.path}${serializeScenarioConfig(scenario.id, parseScenarioConfig(scenario.id, search))}`}
              end
              className={({ isActive }) => `scenario-tab${isActive ? " active" : ""}`}
            >
              {scenario.label}
            </NavLink>
          ))}
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to={`/fixed${search}${hash}`} replace />} />
          {scenarios.map((scenario) => (
            <Route
              key={scenario.id}
              path={scenario.path}
              element={
                <ScenarioExperiment
                  key={scenario.id}
                  activeScenario={scenario.id}
                  {...sandboxConfiguration}
                />
              }
            />
          ))}
          <Route path="*" element={
            <section className="panel not-found">
              <h2>Scenario not found</h2>
              <p>No scenario is available at <code>{pathname}</code>. Choose a scenario above or return to fixed heights.</p>
              <Link to={`/fixed${search}`}>Go to fixed heights</Link>
            </section>
          } />
        </Routes>
      </main>
    </div>
  )
}

function ScenarioExperiment({
  activeScenario,
  preset,
  config,
  updateConfig,
  applyPreset,
  restoreDefaultConfig,
}: ReturnType<typeof useSandboxConfig> & { activeScenario: ScenarioId }) {
  const [renderedItemCount, setRenderedItemCount] = useState(0)
  const activeExperimentRef = useRef<ScenarioExperimentHandle>(null)
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousHistoryEntryKey = useRef(location.key)
  const previousInitialItemCount = useRef(config.itemCount)

  useLayoutEffect(() => {
    const restoredHistoryEntry = previousHistoryEntryKey.current !== location.key && navigationType === "POP"
    const initialItemCountChanged = previousInitialItemCount.current !== config.itemCount
    previousHistoryEntryKey.current = location.key
    previousInitialItemCount.current = config.itemCount
    if (restoredHistoryEntry || initialItemCountChanged) {
      activeExperimentRef.current?.resetExperiment(config)
    }
  }, [location.key, navigationType, config])

  function resetExperiment() {
    activeExperimentRef.current?.resetExperiment(config)
  }

  function restoreDefaultExperiment() {
    restoreDefaultConfig()
    activeExperimentRef.current?.resetExperiment(defaultConfig)
  }

  return (
    <>
      <div className="experiment-layout">
        <section className="panel experiment-panel">
          <div className="panel-header">
            <h2>Experiment</h2>
          </div>
          {(activeScenario === "fixed-heights" ||
            activeScenario === "variable-initial-heights") && (
            <InitialHeightsScenario
              ref={activeExperimentRef}
              sizing={activeScenario === "fixed-heights" ? "fixed" : "variable"}
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "changing-heights" && (
            <ChangingSizesScenario
              ref={activeExperimentRef}
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "mutations-and-reordering" && (
            <MutationsScenario
              ref={activeExperimentRef}
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "drag-and-drop" && (
            <DragAndDropScenario
              ref={activeExperimentRef}
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}
        </section>

        <aside className="panel configuration-panel">
          <div className="panel-header">
            <h2>Configuration</h2>
          </div>

          <ConfigurationPanel
            scenario={activeScenario}
            preset={preset}
            config={config}
            updateConfig={updateConfig}
            applyPreset={applyPreset}
            restoreDefaultConfig={restoreDefaultExperiment}
            resetExperiment={resetExperiment}
          />
        </aside>
      </div>

      <DiagnosticsPanel
        config={config}
        sizing={activeScenario === "fixed-heights" ? "fixed" : "variable"}
        renderedItemCount={renderedItemCount}
      />
    </>
  )
}

export default App
