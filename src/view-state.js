import { startOfWeek as utilStartOfWeek } from './utils/date-utils.js'

const DEFAULT_KEY = 'simple-calendar-state'
const DEFAULT_STATE = {
  view: 'week',
  theme: 'light',
  currentDate: '2026-01-10'
}


export class ViewState {
  constructor(initial = {}) {
    this._key = DEFAULT_KEY
    this._listeners = new Map()
    this._state = { ...DEFAULT_STATE, ...initial }
    // auto-load if present
    if (localStorage.getItem(this._key)) {
      this.loadState()
    }
  }

  on(evt, cb) {
    if (!this._listeners.has(evt)) this._listeners.set(evt, [])
    this._listeners.get(evt).push(cb)
  }

  _emit(evt, payload) {
    const list = this._listeners.get(evt) || []
    for (const cb of list) cb(payload)
  }

  getState() {
    // return shallow copy
    return { ...this._state }
  }

  switchView(view) {
    if (this._state.view === view) return
    this._state.view = view
    this._emit('viewchange', this.getState())
    // keep currentDate unchanged (retain behavior)
  }

  saveState() {
    localStorage.setItem(this._key, JSON.stringify(this._state))
  }

  loadState() {
    const raw = localStorage.getItem(this._key)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      this._state = { ...this._state, ...parsed }
      return this.getState()
    } catch (e) {
      return null
    }
  }

  getCurrentWeek(weekStart = 1) {
    // use date-utils implementation to ensure same UTC-normalized result
    return utilStartOfWeek(this._state.currentDate, weekStart)
  }
}
