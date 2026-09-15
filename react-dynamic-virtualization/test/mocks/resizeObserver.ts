import { vi } from "vitest"

export class MockResizeObserver {
  static instances: MockResizeObserver[] = []

  callback: ResizeObserverCallback
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    MockResizeObserver.instances.push(this)
  }

  static reset(): void {
    MockResizeObserver.instances.length = 0
  }
}
