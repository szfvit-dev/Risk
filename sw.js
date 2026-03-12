
const CACHE_NAME = 'risk-v1.0.1'; // 🔥 每次更新都要改版本號！
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// 安裝事件
self.addEventListener('install', (event) => {
  console.log('SW: 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: 快取檔案');
        return cache.addAll(urlsToCache);
      })
  );
  // 🔥 強制啟用新版本
  self.skipWaiting();
});

// 啟用事件
self.addEventListener('activate', (event) => {
  console.log('SW: 啟用中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 🔥 刪除舊快取
          if (cacheName !== CACHE_NAME) {
            console.log('SW: 刪除舊快取', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 🔥 立即控制所有頁面
  self.clients.claim();
});

// 網路請求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 🔥 網路優先策略（確保獲取最新內容）
    fetch(event.request)
      .then((response) => {
        // 如果網路請求成功，更新快取
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // 網路失敗時使用快取
        return caches.match(event.request);
      })
  );
});
// 🔥 監聽來自頁面的訊息（添加到 sw.js 最後）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: 收到跳過等待訊息');
    self.skipWaiting();
  }
});
