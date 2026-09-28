const CACHE_NAME = 'subtitle-edit-live-cache';

// ئەو فایلە سەرەکییانەی دەبێت یەکسەر پاشەکەوت بن بۆ دۆخی بێخەت
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './KurdForest.ttf',
    './icon.svg',
    './manifest.json'
];

// لە یەکەم دابەزاندندا فایلەکان دەهێنێت و یەکسەر دەستبەکار دەبێت
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// کۆنترۆڵی دەستبەجێ بەبێ وەستان
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// لایڤ کاش: هەمیشە نوێترین فایل لەسەر ئینتەرنێت دەهێنێت و خۆی کاشەکە نوێ دەکاتەوە
self.addEventListener('fetch', (event) => {
    // پاراستنی داواکارییەکانی POST (وەک بارکردنی وێنە بۆ ImgBB) تا تێکنەچن
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // ئەگەر فایلەکە بە سەرکەوتوویی لە خەتەوە هات، ڕاستەوخۆ دەچێتە جێگەی فایلە کۆنەکە
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedResponse);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                // ئەگەر ئینتەرنێت پچڕابوو، کۆتا وەشانی سەیڤکراو دەکاتەوە
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // گەر بە بێخەت لاپەڕەکە داوا کرا، دڵنیادەبێتەوە لە کردنەوەی index.html
                if (event.request.mode === 'navigate') {
                    const fallback = await caches.match('./index.html') || await caches.match('./');
                    if (fallback) return fallback;
                }
            })
    );
});
