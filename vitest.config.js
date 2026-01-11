import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom'
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