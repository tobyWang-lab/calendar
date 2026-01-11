import { ViewState } from './src/view-state.js'
import { renderWeek } from './src/renderers/week-renderer.js'
import { renderMonth } from './src/renderers/month-renderer.js'

// Default data
const DEFAULT_EVENTS = [
  { id: 'evt_1', title: '會議', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00', allDay:false },
  { id: 'evt_2', title: '聚會', start: '2026-01-15T18:00:00+08:00', end: '2026-01-15T20:00:00+08:00', allDay:false },
  { id: 'evt_3', title: '聚會2', start: '2026-01-15T20:00:00+08:00', end: '2026-01-15T21:00:00+08:00', allDay:false }
]

const LUNAR = { '2026-01-10': '農曆十二月廿九' }

export let viewState = null
export let events = DEFAULT_EVENTS

export function renderCurrentView(container){
  const state = viewState.getState()
  container.innerHTML = ''
  if(state.view === 'week'){
    renderWeek(container, viewState.getCurrentWeek(), events)
  } else {
    renderMonth(container, new Date(state.currentDate), events, LUNAR)
  }
}

export function init(){
  // init view state with defaults
  viewState = new ViewState({ currentDate: '2026-01-10', view: 'week', theme: 'light' })

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

  // listen to view changes
  viewState.on('viewchange', ()=>{
    renderCurrentView(container)
  })

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
