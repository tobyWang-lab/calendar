import { describe, it, expect, beforeEach } from 'vitest'
import { ViewState } from '../src/view-state.js'
import { renderMonth } from '../src/renderers/month-renderer.js'

beforeEach(()=>{
  globalThis.localStorage = (function(){
    let storage = {}
    return {
      getItem(key){ return storage.hasOwnProperty(key) ? storage[key] : null },
      setItem(key,val){ storage[key] = String(val) },
      removeItem(key){ delete storage[key] },
      clear(){ storage = {} }
    }
  })()
})

describe('month-renderer (T14)', ()=>{
  it('renders 6 rows x 7 cols (42 cells) and shows today dot for 2026-01-10', ()=>{
    const vs = new ViewState({ currentDate: '2026-01-10', view: 'week' })
    const container = document.createElement('div')

    vs.on('viewchange', ()=>{
      if(vs.getState().view === 'month'){
        renderMonth(container, new Date(vs.getState().currentDate))
      }
    })

    vs.switchView('month')
    const cells = container.querySelectorAll('.month-cell')
    expect(cells.length).toBe(42)

    const todayCell = container.querySelector('[data-date="2026-01-10"]')
    expect(todayCell).toBeTruthy()
    const dot = todayCell.querySelector('.today-dot')
    expect(dot).toBeTruthy()
  })

  it('shows up to 3 events and +N indicator with lunar tooltip', ()=>{
    const vs = new ViewState({ currentDate: '2026-01-10', view: 'week' })
    const container = document.createElement('div')

    const events = [
      { id: 'e1', title: 'A', start: '2026-01-10T08:00:00+08:00', end: '2026-01-10T09:00:00+08:00' },
      { id: 'e2', title: 'B', start: '2026-01-10T10:00:00+08:00', end: '2026-01-10T11:00:00+08:00' },
      { id: 'e3', title: 'C', start: '2026-01-10T12:00:00+08:00', end: '2026-01-10T13:00:00+08:00' },
      { id: 'e4', title: 'D', start: '2026-01-10T14:00:00+08:00', end: '2026-01-10T15:00:00+08:00' }
    ]

    const lunarData = { '2026-01-10': '農曆十二月廿九' }

    vs.on('viewchange', ()=>{
      if(vs.getState().view === 'month'){
        renderMonth(container, new Date(vs.getState().currentDate), events, lunarData)
      }
    })

    vs.switchView('month')
    const cell = container.querySelector('[data-date="2026-01-10"]')
    const items = cell.querySelectorAll('.event-summary > .item')
    expect(items.length).toBe(3)
    const plus = cell.querySelector('.more-count')
    expect(plus).toBeTruthy()
    expect(plus.textContent).toBe('+1')
    // lunar tooltip stored in data-lunar attribute
    expect(cell.querySelector('.date-header').getAttribute('data-lunar')).toBe('農曆十二月廿九')
  })
})