const CACHE_NAME = 'arrow-maliyet-v1';
const URLS = [
  '/maliyet/maliyet.html',
  '/maliyet/manifest.json',
  '/maliyet/icon-192.png',
  '/maliyet/icon-512.png',
];

// Kurulum: tüm dosyaları önbelleğe al
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

// İstek: önce önbellekten, yoksa ağdan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Başarılı yanıtları önbelleğe ekle
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached); // Ağ yoksa önbellekten dön
    })
  );
});
