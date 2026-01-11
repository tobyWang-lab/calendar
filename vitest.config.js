import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // exclude Playwright / e2e folders and node_modules from Vitest
    exclude: ['playwright/**', 'tests/e2e/**', 'e2e/**', 'node_modules/**']
  },
  coverage: {
    provider: 'istanbul',
    reporter: ['text', 'lcov'],
    statements: 90,
    branches: 90,
    functions: 90,
    lines: 90
  }
})