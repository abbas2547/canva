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
    <div className="page-transition min-h-screen bg-transparent px-6 py-24 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Simple, transparent pricing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Choose your creative workspace</h1>
          <p className="mt-5 text-slate-500">Paid plans are coming soon. Start with the complete core editor for free today.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`interactive-surface relative rounded-3xl border p-8 ${plan.popular ? "border-indigo-300 bg-indigo-50/80 shadow-xl shadow-indigo-100" : "border-slate-200 bg-white shadow-sm"}`}
            >
              {plan.popular && <span className="absolute right-6 top-6 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">MOST POPULAR</span>}
              <h2 className="text-3xl font-black text-slate-950">{plan.name}</h2>
              <p className="mt-6 text-4xl font-black text-slate-950">{plan.price}<span className="text-base font-medium text-slate-500"> / month</span></p>
              <p className="mt-4 min-h-12 text-slate-600">{plan.description}</p>
              <ul className="mt-7 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => <li key={feature}><span className="mr-2 text-indigo-600">✓</span>{feature}</li>)}
              </ul>
              <button type="button" disabled={plan.name !== "Free"} className="interactive-button mt-8 w-full rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                {plan.name === "Free" ? "Start for free" : "Coming soon"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-xl font-bold text-slate-950">Plan comparison</h2></div>
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-950">Feature</span><span>Free</span><span>Pro</span><span>Business</span>
            {["Canvas editor", "Text and shapes", "Cloud saving", "Advanced tools", "AI features", "Team collaboration"].map((feature, index) => (
              <span key={feature} className="contents"><span className="text-slate-500">{feature}</span><span>{index < 3 ? "✓" : "—"}</span><span>{index < 3 ? "✓" : "Coming soon"}</span><span>{index < 3 ? "✓" : "Coming soon"}</span></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}