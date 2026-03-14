// Kill-switch: unregister any previous service workers from this origin
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() =>
      self.registration.unregister()
    )
  );
});
