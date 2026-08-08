const CACHE_NAME = "slangify-v2";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./favicon.svg",

    "./data/a1_a2.json",
    "./data/b1_b2.json",
    "./data/c1_c2.json",
    "./data/slang_gaming.json"
];


/* =========================================
   INSTALL
   ========================================= */

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME).then((cache) => {

            console.log("[PWA] Installing new version...");

            return cache.addAll(ASSETS_TO_CACHE);

        })

    );

    /*
     * Don't wait for the old Service Worker.
     * Activate this version immediately.
     */
    self.skipWaiting();

});


/* =========================================
   ACTIVATE
   ========================================= */

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames.map((cacheName) => {

                    /*
                     * Delete every old Slangify cache
                     */
                    if (
                        cacheName.startsWith("slangify-") &&
                        cacheName !== CACHE_NAME
                    ) {

                        console.log(
                            "[PWA] Deleting old cache:",
                            cacheName
                        );

                        return caches.delete(cacheName);

                    }

                })

            );

        }).then(() => {

            /*
             * Take control of all open pages immediately
             */
            return self.clients.claim();

        })

    );

});


/* =========================================
   FETCH
   ========================================= */

self.addEventListener("fetch", (event) => {

    /*
     * Only handle GET requests
     */
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request).then((cachedResponse) => {

            /*
             * If file is cached → use it
             */
            if (cachedResponse) {
                return cachedResponse;
            }

            /*
             * Otherwise download it
             */
            return fetch(event.request).then((networkResponse) => {

                /*
                 * Save successful response to cache
                 */
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    networkResponse.type === "basic"
                ) {

                    const responseClone =
                        networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                }

                return networkResponse;

            });

        })

    );

});