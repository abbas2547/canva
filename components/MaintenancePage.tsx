"use client";

import Image from "next/image";
import { AlertTriangle, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type HealthStatus = "checking" | "healthy" | "unhealthy" | "maintenance";

interface MaintenancePageProps {
  onRetry: () => Promise<void>;
  status: Exclude<HealthStatus, "checking" | "healthy">;
  retrying: boolean;
}

export function MaintenancePage({
  onRetry,
  status,
  retrying,
}: MaintenancePageProps) {
  const isMaintenance = status === "maintenance";

  return (
    <div className="maintenance-page min-h-screen bg-transparent px-5 py-12 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-12">
          <Image
            src="/logo.svg"
            alt="Mini Canva AI"
            width={72}
            height={72}
            className="mx-auto mb-7 rounded-2xl shadow-lg shadow-indigo-200/70"
            priority
          />
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            {isMaintenance ? <AlertTriangle size={25} /> : <WifiOff size={25} />}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">
            Mini Canva AI
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {isMaintenance ? "Website under maintenance" : "We'll be back soon"}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
            {isMaintenance
              ? "Our services are undergoing maintenance. Please try again in a few minutes."
              : "We're having trouble reaching a required service. Please try again in a few minutes."}
          </p>
          <button
            type="button"
            onClick={() => void onRetry()}
            disabled={retrying}
            className="interactive-button mt-8 inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {retrying ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
            {retrying ? "Checking..." : "Try again"}
          </button>
          <p className="mt-6 text-xs text-slate-400">
            Your work is safe. We&apos;ll restore access automatically when services recover.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const healthRequestRef = useRef<AbortController | null>(null);

  const checkHealth = async () => {
    healthRequestRef.current?.abort();
    const controller = new AbortController();
    healthRequestRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const result = (await response.json()) as { status?: HealthStatus };

      if (result.status === "maintenance") {
        setConsecutiveFailures(0);
        setStatus("maintenance");
        return;
      }

      if (!response.ok || result.status !== "healthy") {
        setConsecutiveFailures((failures) => {
          const nextFailures = failures + 1;
          if (nextFailures >= 2) setStatus("unhealthy");
          return nextFailures;
        });
        return;
      }

      setConsecutiveFailures(0);
      setStatus("healthy");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Application health check failed:", error);
      setConsecutiveFailures((failures) => {
        const nextFailures = failures + 1;
        if (nextFailures >= 2) setStatus("unhealthy");
        return nextFailures;
      });
    } finally {
      window.clearTimeout(timeoutId);
      if (healthRequestRef.current === controller) {
        healthRequestRef.current = null;
      }
    }
  };

  useEffect(() => {
    void checkHealth();
    const interval = window.setInterval(() => void checkHealth(), 60_000);
    return () => {
      window.clearInterval(interval);
      healthRequestRef.current?.abort();
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    setConsecutiveFailures(0);
    setStatus("checking");
    await checkHealth();
    setRetrying(false);
  };

  if (status === "maintenance" || status === "unhealthy") {
    return (
      <MaintenancePage
        onRetry={handleRetry}
        retrying={retrying}
        status={status}
      />
    );
  }

  return <>{children}</>;
}
