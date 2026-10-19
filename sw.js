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
    const req = event.request;

    // POST (وەک بارکردنی وێنە) و داواکاری ناHTTP و Range (ڤیدیۆ) دەستکاری نەکرێن
    if (req.method !== 'GET' || !req.url.startsWith('http') || req.headers.has('range')) {
        return;
    }

    event.respondWith((async () => {
        try {
            const networkResponse = await fetch(req);
            if (networkResponse && networkResponse.status === 200) {
                const cloned = networkResponse.clone();
                // waitUntil: دڵنیابوون لەوەی سەیڤکردنەکە تەواو دەبێت
                event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned)));
            }
            return networkResponse;
        } catch (err) {
            // ئینتەرنێت پچڕا: کۆپییە پاشەکەوتکراوەکە بەکاربهێنە
            const cached = await caches.match(req);
            if (cached) return cached;

            // ئەگەر پەڕە بوو و کاش نەبوو، index.html بگەڕێنەرەوە
            if (req.mode === 'navigate') {
                const page = (await caches.match('./')) || (await caches.match('./index.html'));
                if (page) return page;
            }
            return Response.error();
        }
    })());
});
