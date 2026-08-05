// Deliberately does no caching. Course content (lessons, admin edits,
// homework) changes constantly — a caching service worker would risk
// serving stale pages. Its only job is to exist with a fetch handler,
// which browsers require before they'll offer the install prompt.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: let the browser handle every request normally.
});
