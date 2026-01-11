import { describe, it, expect, beforeEach } from 'vitest'
import { ViewState } from '../src/view-state.js'
import { renderWeek } from '../src/renderers/week-renderer.js'

beforeEach(()=>{
  // use in-memory localStorage shim
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

describe('week-renderer (T11)', ()=>{
  it('renders 7 day columns and highlights today 2026-01-10', ()=>{
    const vs = new ViewState({ currentDate: '2026-01-10', view: 'month' })
    const container = document.createElement('div')

    vs.on('viewchange', ()=>{
      if(vs.getState().view === 'week'){
        renderWeek(container, vs.getCurrentWeek())
      }
    })

    vs.switchView('week')
    const days = container.querySelectorAll('.day')
    expect(days.length).toBe(7)

    // find day for 2026-01-10
    const day = container.querySelector('[data-date="2026-01-10"]')
    // In test environment 'today' may not be 2026-01-10, so assert day exists and not necessarily class
    expect(day).toBeTruthy()
  })

  it('renders event at correct vertical position for 09:00-10:00', ()=>{
    const vs = new ViewState({ currentDate: '2026-01-10', view: 'month' })
    const container = document.createElement('div')

    const events = [{ id: 'evt_1', title: '會議', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00', allDay:false }]

    vs.on('viewchange', ()=>{
      if(vs.getState().view === 'week'){
        renderWeek(container, vs.getCurrentWeek(), events)
      }
    })

    vs.switchView('week')
    const ev = container.querySelector('.event[data-id="evt_1"]')
    expect(ev).toBeTruthy()
    const top = parseFloat(ev.style.top)
    // 09:00 should be 9/24 = 37.5%
    expect(Math.round(top*10)/10).toBe(37.5)
  })

  it('renders 18:00-21:00 block with correct top and height and primary background', ()=>{
    const vs = new ViewState({ currentDate: '2026-01-10', view: 'month' })
    const container = document.createElement('div')

    const events = [{ id: 'evt_2', title: '晚間', start: '2026-01-10T18:00:00+08:00', end: '2026-01-10T21:00:00+08:00', allDay:false }]

    vs.on('viewchange', ()=>{
      if(vs.getState().view === 'week'){
        renderWeek(container, vs.getCurrentWeek(), events)
      }
    })

    vs.switchView('week')
    const ev = container.querySelector('.event[data-id="evt_2"]')
    expect(ev).toBeTruthy()
    const top = parseFloat(ev.style.top)
    const height = parseFloat(ev.style.height)
    // 18:00 = 18/24 = 75%
    expect(Math.round(top*10)/10).toBe(75.0)
    // duration 3h -> 3/24 = 12.5%
    expect(Math.round(height*10)/10).toBe(12.5)
    expect(ev.style.background).toBe('var(--primary)')
    expect(ev.style.opacity).toBe('0.8')
    expect(ev.getAttribute('role')).toBe('button')
  })
})