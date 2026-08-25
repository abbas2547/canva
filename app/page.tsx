"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const { user } = useAuth();
  const [totalDesigns, setTotalDesigns] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch Public Stats (optional - gracefully handle if Supabase not configured)
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const { supabase } = await import("@/lib/supabaseData");
        const { count, error } = await supabase
          .from("designs")
          .select("*", {
            count: "exact",
            head: true,
          });

        if (error) {
          // Supabase not configured or table doesn't exist - silently ignore
          setTotalDesigns(0);
        } else {
          setTotalDesigns(count || 0);
        }
      } catch (error) {
        // Network error or Supabase not configured - silently ignore
        setTotalDesigns(0);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-[#020617] text-white flex flex-col justify-between">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl" />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 text-center flex-grow">
        {/* Badge */}
        <span className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6 inline-block">
          {isLoadingStats
            ? "Loading stats..."
            : totalDesigns > 0
              ? `${totalDesigns} Designs Created Already`
              : "AI-Powered Design Platform"}
        </span>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
          Design anything.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create faster.
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Your all-in-one creative workspace for professional designs, image editing,
          templates, layers, exports, and AI-assisted creative work.
        </p>

        {/* Dynamic Main Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {user ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
            >
              Go To Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
            >
              Start Designing Free
            </Link>
          )}

          <Link
            href={user ? "/dashboard" : "/signup"}
            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Explore Features
          </Link>
        </div>

        {/* Preview */}
        <div className="mt-20 relative mx-auto max-w-6xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/canva.png"
              alt="Mini Canva editor preview"
              loading="lazy"
              className="w-full object-contain opacity-90"
            />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Built for momentum</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Everything you need to turn ideas into finished designs.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Canvas editor", "Build polished designs with text, images, shapes, and backgrounds."],
          ["Text controls", "Adjust fonts, size, color, weight, alignment, spacing, and line height."],
          ["Image tools", "Upload, resize, rotate, crop, filter, and arrange your images."],
          ["Shapes and elements", "Add rectangles, circles, triangles, lines, and arrows."],
          ["Layers", "Bring elements forward, send them back, lock them, or hide them."],
          ["Undo and redo", "Experiment freely with reliable editing history."],
          ["Cloud saving", "Save designs to your account and reopen them from the dashboard."],
          ["PNG, JPG, and PDF", "Export completed work in the formats supported by the editor."],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-purple-400/40">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </article>
        ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-purple-950/30">
          <img src="/canva.png" alt="Actual Mini Canva editor interface" loading="lazy" className="w-full rounded-2xl object-contain" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-300">See it in action</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">From a blank canvas to a polished design.</h2>
          <div className="mt-8 space-y-5">
            {[
              ["01", "Start", "Choose a canvas size or continue a design from your dashboard."],
              ["02", "Create", "Add text, images, shapes, and backgrounds from the editor sidebar."],
              ["03", "Refine", "Use properties, layers, filters, and history to get the details right."],
              ["04", "Export", "Save your work to the cloud, then download it as PNG, JPG, or PDF."],
            ].map(([number, title, description]) => (
              <div key={number} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-cyan-200">{number}</span>
                <div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEV & PROJECT NAVIGATION FOOTER */}
      <footer className="relative z-10 w-full border-t border-slate-800 bg-slate-950/60 backdrop-blur-md py-6 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p className="font-semibold text-gray-300">Project Routes Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
            <Link href="/editor" className="hover:text-cyan-400 transition-colors">Editor</Link>
            <Link href="/editor/design-1" className="hover:text-cyan-400 transition-colors">Editor (Design-1)</Link>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link href="/profile" className="hover:text-cyan-400 transition-colors">Profile</Link>
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-cyan-400 transition-colors">Signup</Link>
            <Link href="/forgot-password" className="hover:text-cyan-400 transition-colors">Forgot Password</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}