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
          Design Anything
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Beautifully
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Create stunning graphics, social posts, presentations, thumbnails, and more
          using your own AI-powered design studio.
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
            href="/editor"
            className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Explore Editor
          </Link>
        </div>

        {/* Preview */}
        <div className="mt-20 relative mx-auto max-w-6xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=2000"
              alt="Editor Preview"
              className="w-full object-cover opacity-80"
            />
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