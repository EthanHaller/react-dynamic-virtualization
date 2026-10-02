import "./App.css"
import { useState } from "react"
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel"
import { ConfigurationPanel } from "./components/controls/ConfigurationPanel"
import { useSandboxConfig } from "./config/useSandboxConfig"
import { BasicScenario } from "./scenarios/basic/BasicScenario"
import { ChangingSizesScenario } from "./scenarios/changingSizes/ChangingSizesScenario"
import { MutationsScenario } from "./scenarios/mutations/MutationsScenario"
import { ReorderingScenario } from "./scenarios/reordering/ReorderingScenario"
import { DragAndDropScenario } from "./scenarios/dragAndDrop/DragAndDropScenario"

const scenarios = [
  "Basic",
  "Dynamic Sizes",
  "Changing Sizes",
  "Mutations",
  "Reordering",
  "Drag & Drop",
]

function App() {
  const [activeScenario, setActiveScenario] = useState("Basic")
  const [renderedItemCount, setRenderedItemCount] = useState(0)
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
              key={scenario}
              className={`scenario-tab${
                activeScenario === scenario ? " active" : ""
              }`}
              type="button"
              onClick={() => setActiveScenario(scenario)}
            >
              {scenario}
            </button>
          ))}
        </nav>

        <div className="experiment-layout">
          <section className="panel experiment-panel">
            <div className="panel-header">
              <h2>Experiment</h2>
            </div>
            {activeScenario === "Basic" && (
              <BasicScenario
                config={config}
                onRenderedItemCountChange={setRenderedItemCount}
              />
            )}

            {activeScenario === "Changing Sizes" && (
              <ChangingSizesScenario
                config={config}
                onRenderedItemCountChange={setRenderedItemCount}
              />
            )}

            {activeScenario === "Mutations" && (
              <MutationsScenario
                config={config}
                onRenderedItemCountChange={setRenderedItemCount}
              />
            )}

            {activeScenario === "Reordering" && (
              <ReorderingScenario
                config={config}
                onRenderedItemCountChange={setRenderedItemCount}
              />
            )}

            {activeScenario === "Drag & Drop" && (
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
          config={config}
          renderedItemCount={renderedItemCount}
        />
      </main>
    </div>
  )
}

export default App
