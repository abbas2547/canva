"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          return;
        }
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
