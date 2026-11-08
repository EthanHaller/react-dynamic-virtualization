import { createContext } from "react"

export type LibraryBuild = "local" | "published"

export const LibraryBuildContext = createContext<LibraryBuild>("published")
