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
        <form id="event-form" class="event-form">
          <input type="hidden" id="event-id" />
          <div class="row row-title">
            <input id="event-title" name="title" class="input-title" placeholder="標題" required aria-label="標題" />
          </div>
          <div class="row row-datetimes">
            <input id="event-date" name="date" type="date" class="input-date" required aria-label="日期" />
            <label class="all-day"><input id="event-allday" name="allday" type="checkbox" aria-label="整天"/> 整天</label>
          </div>
          <div class="row row-times">
            <div class="time-picker">
              <select id="event-start-ampm" class="input-time-ampm" aria-label="開始上下午">
                <option value="AM">上午</option>
                <option value="PM">下午</option>
              </select>
              <select id="event-start-hour" class="input-time-hour" aria-label="開始小時"></select>
              <select id="event-start-minute" class="input-time-minute" aria-label="開始分鐘"></select>
              <input id="event-start" name="start" type="hidden" aria-hidden="true" />
            </div>
            <div class="time-sep" aria-hidden="true">～</div>
            <div class="time-picker">
              <select id="event-end-ampm" class="input-time-ampm" aria-label="結束上下午">
                <option value="AM">上午</option>
                <option value="PM">下午</option>
              </select>
              <select id="event-end-hour" class="input-time-hour" aria-label="結束小時"></select>
              <select id="event-end-minute" class="input-time-minute" aria-label="結束分鐘"></select>
              <input id="event-end" name="end" type="hidden" aria-hidden="true" />
            </div>
          </div>
          <div class="row row-desc">
            <textarea id="event-description" name="description" class="input-desc" rows="4" placeholder="詳細內容（選填）" aria-label="詳細內容"></textarea>
          </div>
          <div class="modal-actions">
            <div class="spacer"></div>
            <button type="button" data-close="true">取消</button>
            <button type="submit" class="primary">儲存</button>
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
    const startHidden = document.getElementById('event-start')
    const endHidden = document.getElementById('event-end')
    const startHour = document.getElementById('event-start-hour')
    const startMinute = document.getElementById('event-start-minute')
    const startAMPM = document.getElementById('event-start-ampm')
    // verify that visible selects are ordered and AM/PM is placed leftmost
    const startPicker = startAMPM.parentElement
    expect(startPicker.children[0].id).toBe('event-start-ampm')
    expect(startPicker.children[1].id).toBe('event-start-hour')
    expect(startPicker.children[2].id).toBe('event-start-minute')
    // verify separator exists between start and end pickers
    const sep = document.querySelector('.time-sep')
    expect(sep).toBeTruthy()
    expect(sep.textContent.trim()).toBe('～')
    // hidden value should represent 00:00 in 24h format
    expect(startHidden.value).toBe('00:00')
    expect(endHidden.value).toBe('00:00')
    // ensure default select values reflect midnight: 12:00 AM => hour '12', minute '00', AM
    expect(startHour.value).toBe('12')
    expect(startMinute.value).toBe('00')
    expect(startAMPM.value).toBe('AM')
  })

  it('creates an event via modal and it renders in month cell and supports description + edit prefill', ()=>{
    init()
    // switch to month view and open cell
    document.getElementById('btn-month').click()
    const cell = document.querySelector('[data-date="2026-01-11"]')
    expect(cell).toBeTruthy()
    cell.click()
    const modal = document.getElementById('event-modal')
    const title = document.getElementById('event-title')
    const dateInput = document.getElementById('event-date')
    const desc = document.getElementById('event-description')
    const allDay = document.getElementById('event-allday')
    title.value = '測試事件'
    dateInput.value = '2026-01-11'
    desc.value = '這是一個描述'
    // check all-day and ensure times hide
    allDay.checked = true
    allDay.dispatchEvent(new Event('change', { bubbles:true }))
    // submit form
    document.getElementById('event-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    // modal closed
    expect(modal.getAttribute('aria-hidden')).toBe('true')
    // verify store has the new event with description and isAllDay true
    const found = eventsStore.getAll().find(ev=>ev.title==='測試事件')
    expect(found).toBeTruthy()
    expect(found.description).toBe('這是一個描述')
    expect(found.isAllDay).toBe(true)
    expect(found.start).toBe('2026-01-11T00:00:00+08:00')
    expect(found.end).toBe('2026-01-12T00:00:00+08:00')
    // re-rendered event appears (re-query the DOM because month view re-renders)
    const newCell = document.querySelector('[data-date="2026-01-11"]')
    const items = newCell.querySelectorAll('.event-summary .event-item')
    expect(Array.from(items).some(it=>it.textContent.includes('測試事件'))).toBe(true)

    // click the month summary item to edit and verify prefill (month click)
    const monthItem = newCell.querySelector('.event-summary .event-item')
    expect(monthItem).toBeTruthy()
    monthItem.click()
    const modalAfterMonthClick = document.getElementById('event-modal')
    expect(modalAfterMonthClick.getAttribute('aria-hidden')).toBe('false')
    const descAfterMonth = document.getElementById('event-description')
    const allDayAfterMonth = document.getElementById('event-allday')
    expect(descAfterMonth.value).toBe('這是一個描述')
    expect(allDayAfterMonth.checked).toBe(true)

    // switch to week view to click event and verify edit modal pre-fills description and all-day state (week click)
    document.getElementById('btn-week').click()
    const evEl = document.querySelector(`.event[data-id="${found.id}"]`)
    expect(evEl).toBeTruthy()
    evEl.click()
    const descInput = document.getElementById('event-description')
    const allDayInput = document.getElementById('event-allday')
    expect(descInput.value).toBe('這是一個描述')
    expect(allDayInput.checked).toBe(true)
  })
})
