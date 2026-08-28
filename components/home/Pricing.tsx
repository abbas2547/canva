export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-black">
            pricing
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {["Free", "Pro", "Business"].map((plan) => (
            <div
              key={plan}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-10"
            >
              <h3 className="text-3xl font-black">
                {plan}
              </h3>

              <p className="mt-4 text-slate-300">
                Professional design tools.
              </p>

              <button className="mt-8 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-black">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}