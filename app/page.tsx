"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-[#020617] text-white flex flex-col justify-between">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl" />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 text-center flex-grow">
        {/* Badge */}
        <span className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6 inline-block">
          AI-Powered Design Platform
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
            <Image
              src="/canva.png"
              alt="Mini Canva editor preview"
              width={1920}
              height={1080}
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
          <Image
            src="/canva.png"
            alt="Actual Mini Canva editor interface"
            width={1920}
            height={1080}
            loading="lazy"
            className="w-full rounded-2xl object-contain"
          />
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

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-300">Creative fuel</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Start with inspiration.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">Explore visual directions, then make them yours in the Mini Canva editor.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Editorial moodboards", "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=1000&q=80"],
            ["Bold brand stories", "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1000&q=80"],
            ["Modern social content", "https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=1000&q=80"],
          ].map(([title, image]) => (
            <Link
              key={title}
              href={user ? "/editor" : "/signup"}
              className="group relative min-h-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
              aria-label={`Create ${title}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${image}")` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-lg font-bold text-white">{title}</p>
                <span className="mt-2 inline-block text-sm font-semibold text-cyan-300">Create yours &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-slate-950/90">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Mini Canva AI" width={44} height={44} />
              <div>
                <p className="font-extrabold text-white">Mini Canva AI</p>
                <p className="text-xs text-slate-500">Create boldly. Ship beautifully.</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">A playful, powerful creative studio for turning ideas into designs in minutes.</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Explore</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <Link href="/dashboard" className="transition hover:text-cyan-300">Dashboard</Link>
              <Link href="/editor" className="transition hover:text-cyan-300">Editor</Link>
              <Link href="/pricing" className="transition hover:text-cyan-300">Pricing</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Connect</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <a href="https://instagram.com/abbaszaidi_03" target="_blank" rel="noreferrer" className="transition hover:text-pink-300">Instagram · @abbaszaidi_03</a>
              <a href="https://t.me/Abbaszaidi10" target="_blank" rel="noreferrer" className="transition hover:text-cyan-300">Telegram · @Abbaszaidi10</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} Abbas. All rights reserved.</span>
            <span>Made for creators everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}