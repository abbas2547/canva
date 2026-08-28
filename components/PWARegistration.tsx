"use client";

import { RefreshCw, Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

export default function PWARegistration() {
  const offline = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("online", onStoreChange);
      window.addEventListener("offline", onStoreChange);
      return () => {
        window.removeEventListener("online", onStoreChange);
        window.removeEventListener("offline", onStoreChange);
      };
    },
    () => !navigator.onLine,
    () => false
  );
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        const checkForUpdate = () => void registration.update();
        const handleControllerChange = () => window.location.reload();
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange, { once: true });
        window.setTimeout(checkForUpdate, 60_000);
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    void registerServiceWorker();
  }, []);

  const applyUpdate = () => {
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {offline && (
        <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl">
          <WifiOff size={14} className="text-amber-300" />
          You are offline. Changes will sync when you reconnect.
        </div>
      )}
      {updateReady && !dismissed && (
        <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm items-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl">
          <Wifi size={16} className="shrink-0 text-indigo-600" />
          <span className="flex-1">A new version of Mini Canva is ready.</span>
          <button type="button" onClick={applyUpdate} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"><RefreshCw size={13} /> Update</button>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss update notification" className="text-slate-400 hover:text-slate-700"><X size={15} /></button>
        </div>
      )}
    </>
  );
}
