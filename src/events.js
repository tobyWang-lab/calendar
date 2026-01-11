const STORAGE_KEY = 'calendar-events'

function genId(){
  return 'evt_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8)
}

export class EventsStore {
  constructor(){
    this._listeners = new Map()
    this._events = []
    this.load()
  }

  on(evt, cb){
    if(!this._listeners.has(evt)) this._listeners.set(evt, [])
    this._listeners.get(evt).push(cb)
  }

  _emit(evt, payload){
    const list = this._listeners.get(evt) || []
    for(const cb of list) cb(payload)
  }

  load(){
    const raw = localStorage.getItem(STORAGE_KEY)
    if(!raw) return this._events = []
    try{
      this._events = JSON.parse(raw)
    }catch(e){ this._events = [] }
    return this._events
  }

  save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._events))
    this._emit('change', this.getAll())
  }

  addEvent(evt){
    const id = evt.id || genId()
    const copy = { ...evt, id }
    this._events.push(copy)
    this.save()
    return id
  }

  editEvent(id, changes){
    const idx = this._events.findIndex(e=>e.id===id)
    if(idx === -1) return null
    this._events[idx] = { ...this._events[idx], ...changes }
    this.save()
    return this._events[idx]
  }

  deleteEvent(id){
    const idx = this._events.findIndex(e=>e.id===id)
    if(idx === -1) return false
    this._events.splice(idx,1)
    this.save()
    return true
  }

  getEvent(id){
    return this._events.find(e=>e.id===id) || null
  }

  getAll(){
    return [...this._events]
  }
}
