import { useContext } from "react"
import { VirtualizedList as LocalVirtualizedList } from "../../../react-dynamic-virtualization/src"
import { VirtualizedList as PublishedVirtualizedList } from "react-dynamic-virtualization"
import { LibraryBuildContext } from "./libraryBuilds"

type SandboxVirtualizedListProps<T> =
  Parameters<typeof LocalVirtualizedList<T>>[0] &
  Parameters<typeof PublishedVirtualizedList<T>>[0]

export function SandboxVirtualizedList<T>(props: SandboxVirtualizedListProps<T>) {
  const libraryBuild = useContext(LibraryBuildContext)

  return libraryBuild === "published"
    ? <PublishedVirtualizedList {...props} />
    : <LocalVirtualizedList {...props} />
}
