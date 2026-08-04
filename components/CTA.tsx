import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl rounded-[3rem] border border-white/10 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-16 text-center shadow-2xl">
        <h2 className="text-4xl font-black text-white md:text-6xl">
          Start Creating Today
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
          Professional editor with templates, frames, upload and filters.
        </p>

        <Link
          href="/editor"
          className="mt-10 inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:scale-105"
        >
          Launch Editor
        </Link>
      </div>
    </section>
  );
}