import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { init } from '../script.js'

describe('PWA (T22)', ()=>{
  it('manifest.json exists and has required fields', ()=>{
    const p = path.resolve(process.cwd(), 'manifest.json')
    const raw = fs.readFileSync(p, 'utf8')
    const m = JSON.parse(raw)
    expect(m.name).toBeTruthy()
    expect(m.start_url).toBe('/'
    )
    expect(Array.isArray(m.icons)).toBe(true)
  })

  it('registers service worker when available and not in test mode', async ()=>{
    // ensure localStorage shim for init
    global.localStorage = (function(){
      let s = {}
      return { getItem(k){ return s.hasOwnProperty(k) ? s[k] : null }, setItem(k,v){ s[k]=String(v) }, removeItem(k){ delete s[k] }, clear(){ s = {} } }
    })()

    // simulate non-test env and mock navigator.registration
    const originalVitest = process.env.VITEST
    delete process.env.VITEST

    // minimal DOM expected by init
    document.body.innerHTML = `
      <header class="app-header">
        <div class="controls"><button id="btn-week"></button><button id="btn-month"></button></div>
      </header>
      <main id="app"></main>
      <button id="btn-today"></button>
      <button id="btn-theme"></button>
    `

    global.navigator = global.navigator || {}
    let called = false
    global.navigator.serviceWorker = {
      register: ()=>{ called = true; return Promise.resolve({}) }
    }

    // Call init which should trigger registration
    await init()

    expect(called).toBe(true)
    // cleanup
    if(originalVitest !== undefined) process.env.VITEST = originalVitest
    else delete process.env.VITEST
    delete global.navigator
    delete global.localStorage
  })
})