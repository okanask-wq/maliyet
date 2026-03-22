const CACHE_NAME = 'arrow-maliyet-v2';
const URLS = [
  '/maliyet/maliyet.html',
  '/maliyet/manifest.json',
  '/maliyet/icon-192.png',
  '/maliyet/icon-512.png',
];

// Kurulum: dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS))
  );
  self.skipWaiting();
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strateji: önce ağdan çek (her zaman güncel), internet yoksa önbellekten
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılı yanıtı önbelleğe de yaz (offline için)
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // İnternet yoksa önbellekten dön
        return caches.match(event.request);
      })
  );
});
