export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#060816] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-6xl font-black">
          Pricing Plans
        </h1>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {["Free", "Pro", "Business"].map((plan) => (
            <div
              key={plan}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-10"
            >
              <h2 className="text-4xl font-black">
                {plan}
              </h2>

              <p className="mt-4 text-slate-300">
                Professional design tools.
              </p>

              <button className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}