import { ViewState } from './src/view-state.js'
import { renderWeek } from './src/renderers/week-renderer.js'
import { renderMonth } from './src/renderers/month-renderer.js'
import { EventsStore } from './src/events.js'

// Default data
const DEFAULT_EVENTS = [
  { id: 'evt_1', title: '會議', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00', allDay:false },
  { id: 'evt_2', title: '聚會', start: '2026-01-15T18:00:00+08:00', end: '2026-01-15T20:00:00+08:00', allDay:false },
  { id: 'evt_3', title: '聚會2', start: '2026-01-15T20:00:00+08:00', end: '2026-01-15T21:00:00+08:00', allDay:false }
]

const LUNAR = { '2026-01-10': '農曆十二月廿九' }

export let viewState = null
export let eventsStore = null

export function renderCurrentView(container){
  const state = viewState.getState()
  container.innerHTML = ''
  const events = eventsStore.getAll()
  if(state.view === 'week'){
    renderWeek(container, viewState.getCurrentWeek(), events)
  } else {
    renderMonth(container, new Date(state.currentDate), events, LUNAR)
  }
  // attach day click handlers for create/edit
  container.querySelectorAll('.month-cell, .day').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const date = el.getAttribute('data-date')
      openEventModalForDate(date)
      // when opening modal for a date ensure selects reflect hidden value
      _setTimeSelects('event-start', document.getElementById('event-start').value || '00:00')
      _setTimeSelects('event-end', document.getElementById('event-end').value || '00:00')
      e.stopPropagation()
    })
  })
  // attach event click handlers for edit
  container.querySelectorAll('.event').forEach(ev=>{
    ev.addEventListener('click', (e)=>{
      const id = ev.getAttribute('data-id')
      openEventModalForEdit(id)
      // ensure selects reflect event times
      const found = eventsStore.getEvent(id)
      if(found){
        const start24 = (found.start || '').slice(11,16)
        const end24 = (found.end || '').slice(11,16)
        if(start24) _setTimeSelects('event-start', start24)
        if(end24) _setTimeSelects('event-end', end24)
      }
      e.stopPropagation()
    })
  })
}

// helper: toggle visibility and disabled state of time row
function setAllDayUI(checked){
  const rowTimes = document.querySelector('.row-times')
  const startEl = document.getElementById('event-start')
  const endEl = document.getElementById('event-end')
  if(!rowTimes || !startEl || !endEl) return
  if(checked){
    rowTimes.classList.add('hidden')
    startEl.disabled = true
    endEl.disabled = true
  } else {
    rowTimes.classList.remove('hidden')
    startEl.disabled = false
    endEl.disabled = false
  }
}

function _buildTimeOptions(){
  // build hour (01-12) and minute (00-59) selects
  const hours = Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0'))
  const mins = Array.from({length:60},(_,i)=>String(i).padStart(2,'0'))
  return { hours, mins }
}

function _setTimeSelects(prefix, hh24){
  // hh24 in 'HH:MM' 24-hour local string
  const [h,m] = hh24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  let h12 = h % 12
  if(h12 === 0) h12 = 12
  const hourStr = String(h12).padStart(2,'0')
  const minuteStr = String(m).padStart(2,'0')
  const hourEl = document.getElementById(`${prefix}-hour`)
  const minuteEl = document.getElementById(`${prefix}-minute`)
  const ampmEl = document.getElementById(`${prefix}-ampm`)
  const hidden = document.getElementById(prefix)
  if(hourEl) hourEl.value = hourStr
  if(minuteEl) minuteEl.value = minuteStr
  if(ampmEl) ampmEl.value = ampm
  if(hidden) hidden.value = hh24
}

function _syncSelectsToHidden(prefix){
  const hourEl = document.getElementById(`${prefix}-hour`)
  const minuteEl = document.getElementById(`${prefix}-minute`)
  const ampmEl = document.getElementById(`${prefix}-ampm`)
  const hidden = document.getElementById(prefix)
  if(!hourEl || !minuteEl || !ampmEl || !hidden) return
  let h = parseInt(hourEl.value,10)
  const m = parseInt(minuteEl.value,10)
  const ampm = ampmEl.value
  if(ampm === 'AM' && h === 12) h = 0
  if(ampm === 'PM' && h < 12) h = h + 12
  const hh = String(h).padStart(2,'0')
  const mm = String(m).padStart(2,'0')
  hidden.value = `${hh}:${mm}`
}

function openEventModalForDate(date){
  const modal = document.getElementById('event-modal')
  if(!modal) return
  const idEl = document.getElementById('event-id')
  const titleEl = document.getElementById('event-title')
  const dateEl = document.getElementById('event-date')
  const descEl = document.getElementById('event-description')
  const allDayEl = document.getElementById('event-allday')

  if(idEl) idEl.value = ''
  if(titleEl) titleEl.value = ''
  // default date to app's anchor day when missing
  if(dateEl) dateEl.value = date || '2026-01-10'
  // default to local midnight 00:00 — represent as 24-hour string but set selects so top options are 01/00
  _setTimeSelects('event-start','00:00')
  _setTimeSelects('event-end','00:00')
  if(descEl) descEl.value = ''
  if(allDayEl) {
    allDayEl.checked = false
    setAllDayUI(false)
  }
  modal.setAttribute('aria-hidden','false')
}

function openEventModalForEdit(id){
  const modal = document.getElementById('event-modal')
  if(!modal) return
  const idEl = document.getElementById('event-id')
  const titleEl = document.getElementById('event-title')
  const dateEl = document.getElementById('event-date')
  const startEl = document.getElementById('event-start')
  const endEl = document.getElementById('event-end')
  const descEl = document.getElementById('event-description')
  const allDayEl = document.getElementById('event-allday')

  const evt = eventsStore.getEvent(id)
  if(!evt) return
  if(idEl) idEl.value = evt.id
  if(titleEl) titleEl.value = evt.title
  if(dateEl) dateEl.value = evt.start.slice(0,10)
  // prefill times only when not isAllDay
  const isAllDay = !!evt.isAllDay || !!evt.allDay
  if(startEl) startEl.value = isAllDay ? '' : evt.start.slice(11,16)
  if(endEl) endEl.value = isAllDay ? '' : evt.end.slice(11,16)
  if(descEl) descEl.value = evt.description || ''
  if(allDayEl){
    allDayEl.checked = isAllDay
    setAllDayUI(isAllDay)
  }
  modal.setAttribute('aria-hidden','false')
}

export function init(){
  // init view state with defaults
  viewState = new ViewState({ currentDate: '2026-01-10', view: 'week', theme: 'light' })
  eventsStore = new EventsStore()
  // populate default events only if empty
  if(eventsStore.getAll().length === 0){
    DEFAULT_EVENTS.forEach(e=>eventsStore.addEvent(e))
  }

  const weekBtn = document.getElementById('btn-week')
  const monthBtn = document.getElementById('btn-month')
  const todayBtn = document.getElementById('btn-today')
  const themeBtn = document.getElementById('btn-theme')
  const container = document.getElementById('app')

  // render initial
  renderCurrentView(container)

  weekBtn.addEventListener('click', () => {
    viewState.switchView('week')
  })
  monthBtn.addEventListener('click', () => {
    viewState.switchView('month')
  })

  // listen to view or events changes
  viewState.on('viewchange', ()=>{
    renderCurrentView(container)
  })
  eventsStore.on('change', ()=>renderCurrentView(container))

  todayBtn.addEventListener('click', ()=>{
    viewState._state.currentDate = '2026-01-10'
    renderCurrentView(container)
  })

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light'
    const next = current === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    viewState._state.theme = next
    viewState.saveState()
  })

  // Modal wiring (only if UI modal exists)
  const modal = document.getElementById('event-modal')
  if(modal){
    modal.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click', ()=>modal.setAttribute('aria-hidden','true')))
    const form = document.getElementById('event-form')
    if(form){
      const allDayCheckbox = document.getElementById('event-allday')
      if(allDayCheckbox) allDayCheckbox.addEventListener('change', (e)=>{
        setAllDayUI(e.target.checked)
      })

      // populate hour/minute selects and wire sync to hidden inputs
      const { hours, mins } = _buildTimeOptions()
      for(const prefix of ['event-start','event-end']){
        const hourEl = document.getElementById(`${prefix}-hour`)
        const minuteEl = document.getElementById(`${prefix}-minute`)
        const ampmEl = document.getElementById(`${prefix}-ampm`)
        if(hourEl && hourEl.children.length === 0){
          hours.forEach(h=>{ const opt = document.createElement('option'); opt.value = h; opt.textContent = h; hourEl.appendChild(opt) })
        }
        if(minuteEl && minuteEl.children.length === 0){
          mins.forEach(m=>{ const opt = document.createElement('option'); opt.value = m; opt.textContent = m; minuteEl.appendChild(opt) })
        }
        // ensure DOM order in the time-picker is: ampm, hour, minute, hidden
        const picker = ampmEl ? ampmEl.parentElement : null
        if(picker){
          if(ampmEl) picker.appendChild(ampmEl)
          if(hourEl) picker.appendChild(hourEl)
          if(minuteEl) picker.appendChild(minuteEl)
          const hidden = document.getElementById(prefix)
          if(hidden) picker.appendChild(hidden)
        }
        // wire change events to update hidden input
        if(hourEl) hourEl.addEventListener('change', ()=>_syncSelectsToHidden(prefix))
        if(minuteEl) minuteEl.addEventListener('change', ()=>_syncSelectsToHidden(prefix))
        if(ampmEl) ampmEl.addEventListener('change', ()=>_syncSelectsToHidden(prefix))
      }

      form.addEventListener('submit',(e)=>{
        e.preventDefault()
        const id = document.getElementById('event-id').value
        const title = document.getElementById('event-title').value
        const date = document.getElementById('event-date').value
        // read from hidden inputs (kept in 'HH:MM' 24-hour local format by sync)
        const start = document.getElementById('event-start').value
        const end = document.getElementById('event-end').value
        const description = document.getElementById('event-description').value
        const allDayEl = document.getElementById('event-allday')
        const isAllDay = allDayEl ? allDayEl.checked : false
        let startISO, endISO
        if(isAllDay){
          // start at date 00:00, end is next day 00:00
          startISO = `${date}T00:00:00+08:00`
          // compute next date safely
          const [y,m,d] = date.split('-').map(Number)
          const next = new Date(y, m-1, d+1)
          // format local YYYY-MM-DD to avoid UTC shift
          const nextDate = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`
          endISO = `${nextDate}T00:00:00+08:00`
        } else {
          startISO = start ? `${date}T${start}:00+08:00` : `${date}T00:00:00+08:00`
          endISO = end ? `${date}T${end}:00+08:00` : `${date}T23:59:00+08:00`
        }
        // debug output to verify computed dates in tests
        // console.log('SUBMIT', { date, isAllDay, startISO, endISO })
        const payload = { title, start: startISO, end: endISO, description, isAllDay }
        if(id){
          eventsStore.editEvent(id, payload)
        } else {
          eventsStore.addEvent(payload)
        }
        modal.setAttribute('aria-hidden','true')
      })
    }

    const deleteBtn = document.getElementById('event-delete')
    if(deleteBtn){
      deleteBtn.addEventListener('click', ()=>{
        const id = document.getElementById('event-id').value
        if(id){
          eventsStore.deleteEvent(id)
          modal.setAttribute('aria-hidden','true')
        }
      })
    }
  }

  // service worker register (simple) when not testing
  const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST
  if('serviceWorker' in navigator && !isTest){
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{})
  }
}

// Auto init only when not running in test environment
const isTest = typeof process !== 'undefined' && process.env && process.env.VITEST
if (!isTest) {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
