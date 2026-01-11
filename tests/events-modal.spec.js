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
import { init, eventsStore } from '../script.js'

beforeEach(()=>{
  // setup DOM with modal markup
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

    <div id="event-modal" class="modal" aria-hidden="true">
      <div class="modal-backdrop" data-close="true"></div>
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">事件</h3>
        <form id="event-form">
          <input type="hidden" id="event-id" />
          <label>標題 <input id="event-title" name="title" required/></label>
          <label>日期 <input id="event-date" name="date" type="date" required/></label>
          <label>開始 <input id="event-start" name="start" type="time"/></label>
          <label>結束 <input id="event-end" name="end" type="time"/></label>
          <label><input id="event-allday" name="allday" type="checkbox"/> 整日</label>
          <div class="modal-actions">
            <button type="submit">儲存</button>
            <button type="button" id="event-delete">刪除</button>
            <button type="button" data-close="true">取消</button>
          </div>
        </form>
      </div>
    </div>
  `
  localStorage.clear()
})

describe('event modal flows', ()=>{
  it('opens modal when clicking on month cell and fills date', ()=>{
    init()
    // switch to month view
    document.getElementById('btn-month').click()
    const cell = document.querySelector('[data-date="2026-01-10"]')
    expect(cell).toBeTruthy()
    cell.click()
    const modal = document.getElementById('event-modal')
    expect(modal.getAttribute('aria-hidden')).toBe('false')
    const dateInput = document.getElementById('event-date')
    expect(dateInput.value).toBe('2026-01-10')
  })

  it('creates an event via modal and it renders in month cell', ()=>{
    init()
    // switch to month view and open cell
    document.getElementById('btn-month').click()
    const cell = document.querySelector('[data-date="2026-01-11"]')
    expect(cell).toBeTruthy()
    cell.click()
    const modal = document.getElementById('event-modal')
    const title = document.getElementById('event-title')
    const dateInput = document.getElementById('event-date')
    title.value = '測試事件'
    dateInput.value = '2026-01-11'
    // submit form
    document.getElementById('event-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    // modal closed
    expect(modal.getAttribute('aria-hidden')).toBe('true')
    // verify store has the new event
    expect(eventsStore.getAll().some(ev=>ev.title==='測試事件')).toBe(true)
    // re-rendered event appears (re-query the DOM because month view re-renders)
    const newCell = document.querySelector('[data-date="2026-01-11"]')
    const items = newCell.querySelectorAll('.event-summary .item')
    expect(Array.from(items).some(it=>it.textContent.includes('測試事件'))).toBe(true)
  })
})
