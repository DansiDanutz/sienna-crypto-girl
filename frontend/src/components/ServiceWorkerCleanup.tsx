"use client";

import { useEffect } from "react";

// Unregisters any service workers from the old ZmartyChat PWA that
// was previously deployed at app.zmarty.me. Without this, the PWA's
// service worker intercepts all navigation and serves the old app.
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
  }, []);

  return null;
}
