import { describe, it, expect, beforeEach } from 'vitest'
import { EventsStore } from '../src/events.js'

const STORAGE_KEY = 'calendar-events'

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

describe('EventsStore (T21)', ()=>{
  it('adds an event and persists to localStorage', ()=>{
    const s = new EventsStore()
    const evt = { title: 'Test', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00', allDay:false }
    const id = s.addEvent(evt)
    expect(typeof id).toBe('string')
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(raw)
    expect(parsed.length).toBe(1)
    expect(parsed[0].title).toBe('Test')
  })

  it('edits an existing event', ()=>{
    const s = new EventsStore()
    const id = s.addEvent({ title: 'Old', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00' })
    s.editEvent(id, { title: 'Updated' })
    const e = s.getEvent(id)
    expect(e.title).toBe('Updated')
  })

  it('deletes an event', ()=>{
    const s = new EventsStore()
    const id = s.addEvent({ title: 'ToDelete', start: '2026-01-10T09:00:00+08:00', end: '2026-01-10T10:00:00+08:00' })
    expect(s.getAll().length).toBe(1)
    s.deleteEvent(id)
    expect(s.getAll().length).toBe(0)
  })

  it('emits change events on add/edit/delete', ()=>{
    const s = new EventsStore()
    const cb = vi.fn()
    s.on('change', cb)
    const id = s.addEvent({ title:'A', start:'2026-01-10T09:00:00+08:00', end:'2026-01-10T10:00:00+08:00' })
    expect(cb).toHaveBeenCalled()
    s.editEvent(id, { title: 'B' })
    expect(cb).toHaveBeenCalledTimes(2)
    s.deleteEvent(id)
    expect(cb).toHaveBeenCalledTimes(3)
  })
})