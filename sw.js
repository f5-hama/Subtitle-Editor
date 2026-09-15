const CACHE_NAME = 'subtitle-edit-live-cache';

// یەکسەر جێبەجێ دەبێت بێ وەستان
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// یەکسەر کۆنترۆڵی پەڕەکە دەکات بێ ئەوەی پێویست بە گۆڕینی ڤێرژن بکات
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// لایڤ کاش (Network First) - هەمیشە نوێترین دەهێنێت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // ئەگەر ئینتەرنێت هەبوو، فایلە نوێیەکە بهێنە و ڕاستەوخۆ کاشەکەشی پێ نوێ بکەرەوە
                const clonedResponse = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clonedResponse);
                });
                return networkResponse;
            })
            .catch(() => {
                // تەنها ئەگەر ئینتەرنێتت پچڕا، ئەوکاتە پەنا دەباتە بەر کاشەکە
                return caches.match(event.request);
            })
    );
});
