import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#060816] px-6 py-24 text-white">

      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />

      <div className="relative mx-auto max-w-7xl">

        <div className="grid items-center gap-20 lg:grid-cols-2">

          <div>

            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-xl">
              AI Powered Design Platform
            </div>

            <h1 className="mt-8 text-5xl font-black leading-tight md:text-7xl">
              Design Anything
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                Beautifully
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg text-slate-300">
              Create stunning graphics, social media posts,
              presentations, logos, thumbnails, and more with
              a modern Canva-style editor.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <Link
                href="/editor"
                className="rounded-2xl bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
              >
                Start Designing
              </Link>

              <Link
                href="/templates"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
              >
                Explore Templates
              </Link>

            </div>

          </div>

          <div className="relative">

            <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">

              <img
                src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop"
                alt="hero"
                className="rounded-[1.5rem]"
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}