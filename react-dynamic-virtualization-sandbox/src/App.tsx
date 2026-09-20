import "./App.css"
import { ConfigurationPanel } from "./components/controls/ConfigurationPanel"
import { useSandboxConfig } from "./config/useSandboxConfig"
import { BasicScenario } from "./scenarios/basic/BasicScenario"

const scenarios = [
  "Basic",
  "Dynamic Sizes",
  "Changing Sizes",
  "Mutations",
  "Drag & Drop",
]

function App() {
  const { config, updateConfig, resetConfig } = useSandboxConfig()

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
          {scenarios.map((scenario, index) => (
            <button
              key={scenario}
              className={`scenario-tab${index === 0 ? " active" : ""}`}
              type="button"
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
            <BasicScenario config={config} />
          </section>

          <aside className="panel configuration-panel">
            <div className="panel-header">
              <h2>Configuration</h2>
            </div>

            <ConfigurationPanel
              config={config}
              updateConfig={updateConfig}
              resetConfig={resetConfig}
            />
          </aside>
        </div>

        <section className="panel diagnostics-panel">
          <div className="panel-header">
            <h2>Diagnostics</h2>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
