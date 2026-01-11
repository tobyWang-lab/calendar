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
      e.stopPropagation()
    })
  })
  // attach event click handlers for edit
  container.querySelectorAll('.event').forEach(ev=>{
    ev.addEventListener('click', (e)=>{
      const id = ev.getAttribute('data-id')
      openEventModalForEdit(id)
      e.stopPropagation()
    })
  })
}

function openEventModalForDate(date){
  const modal = document.getElementById('event-modal')
  if(!modal) return
  const idEl = document.getElementById('event-id')
  const titleEl = document.getElementById('event-title')
  const dateEl = document.getElementById('event-date')
  const startEl = document.getElementById('event-start')
  const endEl = document.getElementById('event-end')
  const descEl = document.getElementById('event-description')
  const allDayEl = document.getElementById('event-allday')

  if(idEl) idEl.value = ''
  if(titleEl) titleEl.value = ''
  // default date to app's anchor day when missing
  if(dateEl) dateEl.value = date || '2026-01-10'
  if(startEl) startEl.value = ''
  if(endEl) endEl.value = ''
  if(descEl) descEl.value = ''
  if(allDayEl) allDayEl.checked = false
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
  if(startEl) startEl.value = evt.start.slice(11,16)
  if(endEl) endEl.value = evt.end.slice(11,16)
  if(descEl) descEl.value = evt.description || ''
  if(allDayEl) allDayEl.checked = !!evt.allDay
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
      form.addEventListener('submit',(e)=>{
        e.preventDefault()
        const id = document.getElementById('event-id').value
        const title = document.getElementById('event-title').value
        const date = document.getElementById('event-date').value
        const start = document.getElementById('event-start').value
        const end = document.getElementById('event-end').value
        const description = document.getElementById('event-description').value
        const allDayEl = document.getElementById('event-allday')
        const allDay = allDayEl ? allDayEl.checked : false
        const startISO = start ? `${date}T${start}:00+08:00` : `${date}T00:00:00+08:00`
        const endISO = end ? `${date}T${end}:00+08:00` : `${date}T23:59:00+08:00`
        if(id){
          eventsStore.editEvent(id, { title, start: startISO, end: endISO, allDay, description })
        } else {
          eventsStore.addEvent({ title, start: startISO, end: endISO, allDay, description })
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
