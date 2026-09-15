const cache = new Map<string, number>()

export const DEFAULT_ITEM_HEIGHT = 50

export function getMeasuredHeight(id: string): number | undefined {
  return cache.get(id)
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
