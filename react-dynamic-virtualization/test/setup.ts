import "@testing-library/jest-dom/vitest"
import { afterEach, beforeEach, vi } from "vitest"
import { MockResizeObserver } from "./mocks/resizeObserver"
import { cleanup } from "@testing-library/react"

beforeEach(() => {
  MockResizeObserver.reset()
  vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

afterEach(() => {
  cleanup()
})
