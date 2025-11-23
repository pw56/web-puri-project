const CACHE_NAME = 'web-puri-cache';
const urlsToCache = ['../../app', '../../assets']; // キャッシュ対象に機械学習モデルを追加予定(外部リンクのCORSエラーとか、わからん)

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});