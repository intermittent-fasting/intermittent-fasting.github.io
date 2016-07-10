var staticCacheName = 'ifast-v4';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(staticCacheName).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.html?homescreen=1',
        '/?homescreen=1',
        '/assets/css/style.css',
        '/assets/js/bower/jquery/dist/jquery.min.js',
        '/assets/js/bower/moment/moment.js',
        '/assets/js/bower/dexie/dist/dexie.js',
        '/assets/js/app.js',
        '/sw.js'
      ])
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('ifast') && cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// setInterval(function(){
//     self.registration.showNotification("title", {
//       body: 'The Message',
//       icon: 'images/icon.png',
//       tag: 'my-tag'
//     });
// }, 10000);
