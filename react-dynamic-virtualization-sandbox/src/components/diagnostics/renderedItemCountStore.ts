// Only the diagnostics panel subscribes; publishing a count never updates scenario state.
export function createRenderedItemCountStore() {
  let renderedItemCount = 0
  const subscribers = new Set<() => void>()

  return {
    getSnapshot: () => renderedItemCount,
    subscribe: (subscriber: () => void) => {
      subscribers.add(subscriber)
      return () => { subscribers.delete(subscriber) }
    },
    updateRenderedItemCount: (nextCount: number) => {
      if (nextCount === renderedItemCount) return
      renderedItemCount = nextCount
      subscribers.forEach((subscriber) => subscriber())
    },
  }
}

export type RenderedItemCountStore = ReturnType<typeof createRenderedItemCountStore>
