export {}; // モジュール化してグローバル補完の重複を避ける

import { precacheAndRoute } from 'workbox-precaching';

// Workbox がここに precache manifest を注入する
// injectManifest を使う場合は必須
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'web-puri-cache';
const urlsToCache = [
  '/app', // 開発時はキャッシュしない前提で本番環境しかキャッシュしてない
  '/fonts',
  '/icons',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
      // インストール直後にアクティベートへ進めたい場合は以下を有効化
      // await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return fetch(event.request);
    })()
  );
});