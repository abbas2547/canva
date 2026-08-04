const items = [
  "Photo Editing",
  "Drag & Drop",
  "Templates",
  "Filters",
  "Frames",
  "Export PNG",
];

export default function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black">
            Powerful Features
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <div className="mb-5 h-14 w-14 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500" />

              <h3 className="text-2xl font-bold">
                {item}
              </h3>

              <p className="mt-4 text-slate-300">
                Premium Canva style feature.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}