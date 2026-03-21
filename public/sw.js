const CACHE_NAME = 'anime-archive-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin GET requests — never intercept cross-origin (images, analytics, etc.)
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip navigation requests — let the browser handle SPA routing normally
  if (event.request.mode === 'navigate') return

  // Cache-first for built assets (hashed filenames)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone())
            return response
          })
        })
      )
    )
    return
  }

  // Network-only for everything else — don't cache HTML, JSON indexes, etc.
})
