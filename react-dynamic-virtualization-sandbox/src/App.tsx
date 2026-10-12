import "./App.css"
import { useState } from "react"
import { scenarios, type ScenarioId } from "./routing/scenarioRoutes"
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router"
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel"
import { ConfigurationPanel } from "./components/controls/ConfigurationPanel"
import { useSandboxConfig } from "./config/useSandboxConfig"
import { InitialHeightsScenario } from "./scenarios/initialHeights/InitialHeightsScenario"
import { ChangingSizesScenario } from "./scenarios/changingSizes/ChangingSizesScenario"
import { MutationsScenario } from "./scenarios/mutations/MutationsScenario"
import { DragAndDropScenario } from "./scenarios/dragAndDrop/DragAndDropScenario"

function App() {
  const { pathname, search, hash } = useLocation()
  const { config, updateConfig, applyPreset, resetConfig } = useSandboxConfig()

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
              to={`${scenario.path}${search}`}
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
                  key={`${scenario.id}:${config.itemCount}`}
                  activeScenario={scenario.id}
                  config={config}
                  updateConfig={updateConfig}
                  applyPreset={applyPreset}
                  resetConfig={resetConfig}
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
  config,
  updateConfig,
  applyPreset,
  resetConfig,
}: ReturnType<typeof useSandboxConfig> & { activeScenario: ScenarioId }) {
  const [renderedItemCount, setRenderedItemCount] = useState(0)

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
              sizing={activeScenario === "fixed-heights" ? "fixed" : "variable"}
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "changing-heights" && (
            <ChangingSizesScenario
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "mutations-and-reordering" && (
            <MutationsScenario
              config={config}
              onRenderedItemCountChange={setRenderedItemCount}
            />
          )}

          {activeScenario === "drag-and-drop" && (
            <DragAndDropScenario
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
            config={config}
            updateConfig={updateConfig}
            applyPreset={applyPreset}
            resetConfig={resetConfig}
          />
        </aside>
      </div>

      <DiagnosticsPanel
        config={{
          ...config,
          itemSizing: activeScenario === "fixed-heights" ? "fixed" : "variable",
        }}
        renderedItemCount={renderedItemCount}
      />
    </>
  )
}

export default App
