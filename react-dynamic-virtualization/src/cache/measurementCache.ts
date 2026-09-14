const cache = new Map<string, number>()

const DEFAULT_ITEM_HEIGHT = 50

export function getMeasuredHeight(id: string): number {
  return cache.get(id) ?? DEFAULT_ITEM_HEIGHT
}

export function setMeasuredHeight(id: string, height: number): void {
  cache.set(id, height)
}

export function deleteMeasuredHeight(id: string): void {
  cache.delete(id)
}

export function clearMeasurementCache(): void {
  cache.clear()
}
