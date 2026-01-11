// Provide a localStorage shim before importing modules that use it
globalThis.localStorage = (function(){
  let storage = {}
  return {
    getItem(key){ return storage.hasOwnProperty(key) ? storage[key] : null },
    setItem(key,val){ storage[key] = String(val) },
    removeItem(key){ delete storage[key] },
    clear(){ storage = {} }
  }
})()

import { describe, it, expect, beforeEach } from 'vitest'
import { init, viewState, events } from '../script.js'

beforeEach(()=>{
  // setup DOM
  document.body.innerHTML = `
    <header class="app-header">
      <div class="controls">
        <button id="btn-week"></button>
        <button id="btn-month"></button>
      </div>
    </header>
    <main id="app"></main>
    <button id="btn-today"></button>
    <button id="btn-theme"></button>
  `
  localStorage.clear()
})

describe('integration render', ()=>{
  it('clicking week button renders week view with events', ()=>{
    init()
    const container = document.getElementById('app')
    // ensure default is week
    expect(container.querySelector('.week-view')).toBeTruthy()
    // events rendered
    const ev = container.querySelector('.event[data-id="evt_1"]')
    expect(ev).toBeTruthy()
  })

  it('clicking month button renders month view with event summaries', ()=>{
    init()
    const monthBtn = document.getElementById('btn-month')
    monthBtn.click()
    const container = document.getElementById('app')
    expect(container.querySelector('.month-view-root')).toBeTruthy()
    const cell = container.querySelector('[data-date="2026-01-10"]')
    expect(cell).toBeTruthy()
    const items = cell.querySelectorAll('.event-summary .item')
    expect(items.length).toBeGreaterThan(0)
  })
})