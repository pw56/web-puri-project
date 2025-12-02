// service-worker.ts
export {}; // モジュール化してグローバル補完の重複を避ける

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME: string = 'web-puri-cache';
const urlsToCache: string[] = [
  './',
  '../assets/fonts',
  '../assets/icons',
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
      // インストール直後にアクティベートへ進めたい場合は以下を有効化
      // await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  // 古いキャッシュのクリーンアップなどを行うフック（任意で追加）
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached as Response;
      return fetch(event.request);
    })()
  );
});