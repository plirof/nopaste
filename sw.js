const PRECACHE = 'precache-20200821';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/',
    'script.js',
    'sw.js',
    'style.css',
/*
    'https://cdn.jsdelivr.net/npm/lzma@2.3.2/src/lzma_worker.min.js',
    'https://cdn.jsdelivr.net/combine/' +
        'npm/lzma@2.3.2/src/lzma.min.js,' +
        'npm/slim-select@1.25.0/dist/slimselect.min.js,' +
        'npm/clipboard@2/dist/clipboard.min.js,' +
        'npm/micromodal@0.4.6/dist/micromodal.min.js,' +
        'npm/codemirror@5.52.0,' +
        'npm/codemirror@5.52.0/addon/mode/loadmode.min.js,' +
        'npm/codemirror@5.52.0/addon/mode/overlay.min.js,' +
        'npm/codemirror@5.52.0/addon/mode/multiplex.min.js,' +
        'npm/codemirror@5.52.0/addon/mode/simple.min.js,' +
        'npm/codemirror@5.52.0/addon/scroll/simplescrollbars.js,' +
        'npm/codemirror@5.52.0/mode/meta.min.js',
    'https://cdn.jsdelivr.net/combine/' +
        'npm/bootstrap@4.4.1/dist/css/bootstrap-grid.min.css,' +
        'npm/slim-select@1.25.0/dist/slimselect.min.css,' +
        'npm/codemirror@5.52.0/lib/codemirror.min.css,' +
        'npm/codemirror@5.52.0/addon/scroll/simplescrollbars.css,' +
        'npm/codemirror@5.52.0/theme/dracula.min.css,' +
        'npm/microtip@0.2.2/microtip.min.css',
    'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff2/JetBrainsMono-Regular.woff2',
    'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff/JetBrainsMono-Regular.woff',
    'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/ttf/JetBrainsMono-Regular.ttf',
    'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2',
    */
    'local/lzma_worker.min.js',
    'local/meta.min.js',
    'local/jsDelivr_combined_css.css',
    'local/JetBrainsMono-Regular.woff2',
    'local/JetBrainsMono-Regular.woff',
    'local/JetBrainsMono-Regular.ttf',
    'local/KFOmCnqEu92Fr1Mu4mxK.woff2',

];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://cdn.jsdelivr.net')) {
        return;
    }
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches.open(RUNTIME).then((cache) => {
                return fetch(event.request).then((response) => {
                    // Put a copy of the response in the runtime cache.
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});
