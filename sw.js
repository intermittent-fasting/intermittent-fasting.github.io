self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('ifast').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.html?homescreen=1',
        '/?homescreen=1',
        '/assets/css/style.css',
        '/assets/js/bower/jquery/dist/jquery.min.js',
        '/assets/js/bower/moment/moment.js',
        '/assets/js/app.js',
        '/sw.js'
      ])
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate',  event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
