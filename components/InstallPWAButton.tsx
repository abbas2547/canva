"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWAButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const updateInstalledState = () => setInstalled(mediaQuery.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    updateInstalledState();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mediaQuery.addEventListener("change", updateInstalledState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mediaQuery.removeEventListener("change", updateInstalledState);
    };
  }, []);

  if (!installEvent || installed || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-indigo-100 bg-indigo-50/80 p-1 shadow-sm">
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-white"
      >
        <Download size={16} />
        <span className="hidden lg:inline">Install Mini Canva</span>
        <span className="lg:hidden">Install</span>
      </button>
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={() => setDismissed(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-400 transition hover:bg-white hover:text-indigo-700"
      >
        <X size={14} />
      </button>
    </div>
  );
}
