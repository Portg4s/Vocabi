const CACHE_NAME = "vocabi-cache-v2";
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const withBasePath = (path) => `${BASE_PATH}${path}`;

const SHELL_ASSETS = [
  withBasePath("/"),
  withBasePath("/manifest.webmanifest"),
  withBasePath("/icons/favicon-32.png"),
  withBasePath("/icons/apple-touch-icon.png"),
  withBasePath("/icons/icon-192.png"),
  withBasePath("/icons/icon-512.png"),
  withBasePath("/icons/vocabi-lexicon-prism.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (!["http:", "https:"].includes(requestUrl.protocol)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(withBasePath("/")));
    }),
  );
});
