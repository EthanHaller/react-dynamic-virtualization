import "./App.css"
import { useState } from "react"
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel"
import { ConfigurationPanel } from "./components/controls/ConfigurationPanel"
import { useSandboxConfig } from "./config/useSandboxConfig"
import { InitialHeightsScenario } from "./scenarios/initialHeights/InitialHeightsScenario"
import { ChangingSizesScenario } from "./scenarios/changingSizes/ChangingSizesScenario"
import { MutationsScenario } from "./scenarios/mutations/MutationsScenario"
import { DragAndDropScenario } from "./scenarios/dragAndDrop/DragAndDropScenario"

const scenarios = [
  { id: "fixed-heights", label: "Fixed heights" },
  { id: "variable-initial-heights", label: "Variable initial heights" },
  { id: "changing-heights", label: "Changing heights" },
  { id: "mutations-and-reordering", label: "Mutations and reordering" },
  { id: "drag-and-drop", label: "Drag and drop" },
] as const

type ScenarioId = (typeof scenarios)[number]["id"]

function App() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("fixed-heights")
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
            <button
              key={scenario.id}
              className={`scenario-tab${
                activeScenario === scenario.id ? " active" : ""
              }`}
              type="button"
              aria-pressed={activeScenario === scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
            >
              {scenario.label}
            </button>
          ))}
        </nav>

        <ScenarioExperiment
          key={`${activeScenario}:${config.itemCount}`}
          activeScenario={activeScenario}
          config={config}
          updateConfig={updateConfig}
          applyPreset={applyPreset}
          resetConfig={resetConfig}
        />
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
