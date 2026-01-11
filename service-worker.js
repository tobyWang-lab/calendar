const CACHE_NAME = 'sca-cache-v1'
const RUNTIME = 'runtime-cache'
const PRECACHE_URLS = [ '/', '/index.html', '/style.css', '/script.js', '/manifest.json' ]

self.addEventListener('install', (evt) => {
  self.skipWaiting()
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).catch(()=>{})
  )
})

self.addEventListener('activate', (evt) => {
  clients.claim()
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k=> k === CACHE_NAME ? null : caches.delete(k))))
  )
})

// cache-first for same-origin assets, network-first fallback for others
self.addEventListener('fetch', (evt) => {
  const req = evt.request
  const url = new URL(req.url)
  if(url.origin === location.origin){
    // prefer cache for static assets
    if(req.destination === 'style' || req.destination === 'script' || req.destination === 'image'){
      evt.respondWith(caches.match(req).then(res => res || fetch(req).then(fetchRes => { caches.open(RUNTIME).then(c=>c.put(req, fetchRes.clone())); return fetchRes })) )
      return
    }
  }
  // default network-first
  evt.respondWith(fetch(req).catch(()=>caches.match(req)))
})
