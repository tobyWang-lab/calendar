import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ViewState } from '../src/view-state.js'
import { startOfWeek } from '../src/utils/date-utils.js'

const STORAGE_KEY = 'simple-calendar-state'

beforeEach(() => {
  // Provide an in-memory localStorage shim for environments that don't provide it
  globalThis.localStorage = (function(){
    let storage = {}
    return {
      getItem(key){ return storage.hasOwnProperty(key) ? storage[key] : null },
      setItem(key,val){ storage[key] = String(val) },
      removeItem(key){ delete storage[key] },
      clear(){ storage = {} }
    }
  })()
  localStorage.removeItem(STORAGE_KEY)
})

describe('ViewState (TDD)', () => {
  it('switchView updates state.view and emits event', () => {
    const vs = new ViewState({ currentDate: '2026-01-10' })
    const cb = vi.fn()
    vs.on('viewchange', cb)

    expect(vs.getState().view).toBe('week') // default

    vs.switchView('month')

    expect(vs.getState().view).toBe('month')
    expect(cb).toHaveBeenCalled()
    expect(cb.mock.calls[0][0].view).toBe('month')
  })

  it('saveState and loadState persist to localStorage as JSON', () => {
    const vs = new ViewState({ currentDate: '2026-01-10', theme: 'dark', view: 'month' })
    vs.saveState()

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw)
    expect(parsed.view).toBe('month')
    expect(parsed.theme).toBe('dark')
    expect(parsed.currentDate).toBe('2026-01-10')

    // Create new instance and load
    const vs2 = new ViewState({})
    vs2.loadState()
    expect(vs2.getState().view).toBe('month')
    expect(vs2.getState().theme).toBe('dark')
    expect(vs2.getState().currentDate).toBe('2026-01-10')
  })

  it('retainCurrentDateOnSwitch: currentDate remains after view switch', () => {
    const vs = new ViewState({ currentDate: '2026-01-10' })
    vs.switchView('month')
    expect(vs.getState().currentDate).toBe('2026-01-10')
  })

  it('getCurrentWeek uses date-utils startOfWeek', () => {
    const vs = new ViewState({ currentDate: '2026-01-10' })
    const s = vs.getCurrentWeek() // Date
    const expected = startOfWeek('2026-01-10', 1)
    // Compare date string YYYY-MM-DD
    const fmt = d => d.toISOString().slice(0, 10)
    expect(fmt(s)).toBe(fmt(expected))
  })
})