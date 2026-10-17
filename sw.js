const CACHE_NAME = 'subtitle-edit-live-cache';

// دەستبەجێ دەستپێکردن بێ وەستان
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// کۆنترۆڵکردنی پەڕەکە بە خێرایی
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// گۆڕدرا بۆ سیستەمی (Cache First): یەکەم جار لە کاش وەردەگرێت بۆ ئەوەی خۆکارانە نوێ نەبێتەوە
self.addEventListener('fetch', (event) => {
    // بۆ ئەوەی بەشی بارکردنی وێنە (POST) تێکنەچێت
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // ئەگەر فایلەکە لەناو مۆبایلەکەدا هەبوو (کاش)، ڕاستەوخۆ ئەوە بەکاربهێنە و مەچۆ بۆ خەت
                if (cachedResponse) {
                    return cachedResponse;
                }

                // ئەگەر فایلەکە بۆ یەکەم جار بوو و لە کاش نەبوو، ئینجا لە ئینتەرنێتەوە وەریبگرە
                return fetch(event.request).then((networkResponse) => {
                    // دوای وەرگرتنی، کۆپییەکی نوێ لەناو مۆبایلەکە سەیڤ بکە بۆ جارانەکانی داهاتوو
                    if (networkResponse && networkResponse.status === 200) {
                        const clonedResponse = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clonedResponse);
                        });
                    }
                    return networkResponse;
                });
            })
    );
});
