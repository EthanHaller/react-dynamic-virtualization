export const scenarios = [
  { id: "fixed-heights", path: "/fixed", label: "Fixed heights" },
  { id: "variable-initial-heights", path: "/variable", label: "Variable initial heights" },
  { id: "changing-heights", path: "/changing", label: "Changing heights" },
  { id: "mutations-and-reordering", path: "/mutations", label: "Mutations and reordering" },
  { id: "drag-and-drop", path: "/drag-and-drop", label: "Drag and drop" },
] as const

export type ScenarioId = (typeof scenarios)[number]["id"]
