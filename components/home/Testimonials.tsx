export default function Testimonials() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-5xl font-black">
          Loved By Creators
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
            >
              <p className="text-slate-300">
                Amazing editor with professional templates and smooth UI.
              </p>

              <h3 className="mt-6 font-bold">
                Creator {i}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}