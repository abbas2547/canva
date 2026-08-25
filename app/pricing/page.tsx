export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Everything you need to start designing.",
      features: ["Basic editor", "Cloud-saved designs", "PNG export"],
    },
    {
      name: "Pro",
      price: "₹499",
      description: "More room for ambitious creative work.",
      features: ["Unlimited designs", "Advanced editing tools", "Premium AI features"],
      popular: true,
    },
    {
      name: "Business",
      price: "₹999",
      description: "A workspace for growing teams.",
      features: ["Everything in Pro", "Team workspace", "Priority support"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#060816] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Simple, transparent pricing</p>
          <h1 className="mt-4 text-5xl font-black sm:text-6xl">Choose your creative workspace</h1>
          <p className="mt-5 text-slate-400">Paid plans are coming soon. Start with the complete core editor for free today.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[2rem] border p-8 ${plan.popular ? "border-indigo-400/70 bg-indigo-500/10 shadow-2xl shadow-indigo-950/40" : "border-white/10 bg-white/5"}`}
            >
              {plan.popular && <span className="absolute right-6 top-6 rounded-full bg-indigo-400/20 px-3 py-1 text-xs font-bold text-indigo-200">MOST POPULAR</span>}
              <h2 className="text-3xl font-black">{plan.name}</h2>
              <p className="mt-6 text-4xl font-black">{plan.price}<span className="text-base font-medium text-slate-400"> / month</span></p>
              <p className="mt-4 min-h-12 text-slate-300">{plan.description}</p>
              <ul className="mt-7 space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <button type="button" disabled={plan.name !== "Free"} className="mt-8 w-full rounded-2xl bg-white px-5 py-4 font-semibold text-black transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60">
                {plan.name === "Free" ? "Start for free" : "Coming soon"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5"><h2 className="text-xl font-bold">Plan comparison</h2></div>
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm text-slate-300">
            <span className="font-semibold text-white">Feature</span><span>Free</span><span>Pro</span><span>Business</span>
            {["Basic editor", "Unlimited designs", "Advanced tools", "AI features", "Team features"].map((feature, index) => (
              <span key={feature} className="contents"><span className="text-slate-400">{feature}</span><span>{index === 0 ? "✓" : "—"}</span><span>{index === 0 || index > 0 ? "Coming soon" : "—"}</span><span>{index === 0 || index > 0 ? "Coming soon" : "—"}</span></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}