"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export default function LandingPage() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion
    ? {}
    : {
        initial: false,
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.5, ease: "easeOut" as const },
      };

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden bg-transparent text-slate-900 flex flex-col justify-between">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="animated-orb animated-orb-indigo pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animated-orb animated-orb-cyan pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl"
      />

      {/* HERO */}
      <motion.section
        className="relative max-w-7xl mx-auto px-6 py-20 text-center flex-grow"
        {...reveal}
      >
        {/* Badge */}
        <motion.span
          className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-700 text-sm font-medium mb-6 inline-block"
          initial={false}
        >
          AI-Powered Design Platform
        </motion.span>

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
          <Link
            href={user ? "/dashboard" : "/login"}
            className="interactive-button inline-flex px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            {user ? "Go To Dashboard" : "Start Designing Free"}
          </Link>

          <Link
            href={user ? "/dashboard" : "/signup"}
            className="interactive-button inline-flex px-8 py-4 bg-white text-slate-800 font-bold rounded-xl border border-slate-300 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            Explore Features
          </Link>
        </div>

        {/* Preview */}
        <div className="mt-20 relative mx-auto grid max-w-6xl items-center gap-10 text-left lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative mx-auto w-full max-w-2xl lg:translate-x-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25"></div>
            <motion.div
              className="interactive-surface relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70"
              initial={false}
            >
              <Image
                src="https://plus.unsplash.com/premium_photo-1682141028605-b2456e2bab14?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Creative photo editing workspace"
                width={900}
                height={700}
                loading="lazy"
                className="h-auto max-h-[420px] w-full object-cover opacity-95"
              />
            </motion.div>
          </div>
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">
              Edit with intention
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Every great design starts with one thoughtful edit.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Mini Canva gives your ideas room to breathe. Refine a photo, shape a
              story, and turn a simple moment into something worth sharing.
            </p>
            <Link
              href={user ? "/editor" : "/signup"}
              className="interactive-button mt-7 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/70 hover:bg-indigo-700"
            >
              Bring your idea to life <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-20" {...reveal}>
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Built for momentum</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Everything you need to turn ideas into finished designs.</h2>
        </div>
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={reduceMotion ? undefined : { show: { transition: { staggerChildren: 0.06 } } }}
          initial={false}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, amount: 0.1 }}
        >
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
          <motion.article
            key={title}
            className="interactive-surface stagger-item rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/70"
          >
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </motion.article>
        ))}
        </motion.div>
      </motion.section>

      <motion.section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" {...reveal}>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-indigo-100/80">
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
      </motion.section>

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
              className="interactive-surface group relative min-h-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
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

      <footer className="relative z-10 overflow-hidden border-t border-slate-200 bg-white/90">
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