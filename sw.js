// Service Worker — Operatore ANM
const CACHE = 'anm-v2';
const ASSETS = [
  '/ANM_OPERATOR/',
  '/ANM_OPERATOR/index.html',
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  // Firebase e CDN: sempre dalla rete
  if(e.request.url.includes('firebase')||e.request.url.includes('cdnjs')||
     e.request.url.includes('gstatic')||e.request.url.includes('fonts.g')){
    e.respondWith(fetch(e.request).catch(()=>new Response('', {status:503})));
    return;
  }
  // Resto: cache first, poi rete
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        if(resp.ok){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return resp;
      }).catch(()=>caches.match('/ANM_OPERATOR/index.html'));
    })
  );
});
