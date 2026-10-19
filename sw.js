const CACHE_NAME = 'subtitle-edit-live-cache';

// دەستبەجێ دەستپێکردن بێ وەستان
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// کۆنترۆڵکردنی پەڕەکە بە خێرایی
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// لایڤ کاش: هەمیشە نوێترین فایل لە خەت وەردەگرێت، ئەگەر خەت نەبوو پەنا بۆ کاش دەبات
self.addEventListener('fetch', (event) => {
    // بۆ ئەوەی بەشی بارکردنی وێنە (POST) تێکنەچێت
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // ئەگەر فایلەکە بە سەرکەوتوویی هات، کۆپییەکی نوێ لەناو مۆبایلەکە سەیڤ بکە
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // ئەگەر ئینتەرنێت پچڕا، کۆپییە پاشەکەوتکراوەکەی ناو مۆبایلەکە بکەرەوە
                return caches.match(event.request);
            })
    );
});
