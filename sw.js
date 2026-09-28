const CACHE_NAME = 'subtitle-edit-live-cache';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        // { cache: 'no-cache' } وادەکات هەمیشە پشکنین بۆ نوێترین فایلی گیتھەب بکات بەبێ دواکەوتن
        fetch(event.request, { cache: 'no-cache' })
            .then((networkResponse) => {
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedResponse);
                });
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
