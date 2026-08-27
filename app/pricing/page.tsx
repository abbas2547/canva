"use client";

import { FormEvent, useState } from "react";
import Script from "next/script";
import { CheckCircle2, Loader2, Phone, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { canUpgradeTo } from "@/lib/subscription";
import type { SubscriptionPlan } from "@/lib/subscription";

type PlanId = "free" | "pro" | "business";
type PaymentStatus = "idle" | "preparing" | "processing" | "success" | "failed" | "pending" | "active";

interface CashfreeCheckout {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget: "_modal";
  }) => Promise<unknown>;
}

interface CashfreeFactory {
  (options: { mode: "sandbox" | "production" }): CashfreeCheckout;
}

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

const plans: Array<{
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    description: "Everything you need to start designing.",
    features: ["Basic editor", "Cloud-saved designs", "PNG export"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹5",
    description: "More room for ambitious creative work.",
    features: ["Unlimited designs", "Advanced editing tools", "Premium AI features"],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₹999",
    description: "A workspace for growing teams.",
    features: ["Everything in Pro", "Team workspace", "Priority support"],
  },
];

export default function PricingPage() {
  const { user, subscriptionPlan, loading: authLoading, subscriptionLoading } = useAuth();
  const router = useRouter();
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const planReady = !authLoading && !subscriptionLoading;
  const effectivePlan: SubscriptionPlan = subscriptionPlan;
  const paidPlan = plans.find((plan) => plan.id === selectedPlan && plan.id !== "free");
  const isBusy = paymentStatus === "preparing" || paymentStatus === "processing";

  const startCheckout = (planId: PlanId) => {
    if (planId === "free") return;
    if (!user) {
      router.push(`/login?from=${encodeURIComponent("/pricing")}`);
      return;
    }
    setSelectedPlan(planId);
    setCustomerPhone(user.phoneNumber?.replace(/^\+91/, "") || "");
    setPaymentStatus("idle");
  };

  const verifyPayment = async (orderId: string, token: string) => {
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    });
    return (await response.json()) as { success?: boolean; status?: PaymentStatus; error?: string };
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paidPlan || !user || !cashfreeReady || !window.Cashfree) return;

    try {
      setPaymentStatus("preparing");
      const token = await user.getIdToken();
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: paidPlan.id, customerPhone }),
      });
      const order = (await orderResponse.json()) as {
        success?: boolean;
        orderId?: string;
        paymentSessionId?: string;
        environment?: "sandbox" | "production";
        error?: string;
      };
      if (!orderResponse.ok || !order.success || !order.orderId || !order.paymentSessionId) {
        throw new Error(order.error || "Unable to prepare secure checkout.");
      }

      setPaymentStatus("processing");
      const cashfree = window.Cashfree({ mode: order.environment || "sandbox" });
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const verification = await verifyPayment(order.orderId, token);
        if (verification.success && verification.status === "active") {
          setPaymentStatus("success");
          toast.success("Payment successful! Your plan is active.");
          window.setTimeout(() => window.location.reload(), 900);
          return;
        }
        if (verification.status === "failed") {
          setPaymentStatus("failed");
          toast.error("Payment failed. Please try again.");
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2500));
      }

      setPaymentStatus("pending");
      toast("Your payment is being verified. We’ll update your account shortly.");
    } catch (error) {
      console.error("Checkout error:", error);
      setPaymentStatus("failed");
      toast.error(error instanceof Error ? error.message : "Payment failed. Please try again.");
    }
  };

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
        onLoad={() => setCashfreeReady(true)}
      />
      <div className="page-transition min-h-screen bg-transparent px-6 py-24 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Simple, transparent pricing</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Choose your creative workspace</h1>
            <p className="mt-5 text-slate-500">Start with the complete core editor for free, or unlock more room for ambitious creative work.</p>
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
                <button
                  type="button"
                  disabled={!planReady || plan.id === effectivePlan || !canUpgradeTo(effectivePlan, plan.id) || isBusy}
                  onClick={() => startCheckout(plan.id)}
                  className="interactive-button mt-8 w-full rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!planReady
                    ? "Checking plan..."
                    : plan.id === effectivePlan
                    ? "Current plan"
                    : effectivePlan !== "free" && plan.id === "free"
                      ? "Included"
                      : plan.id === "free"
                        ? "Start for free"
                        : `Upgrade to ${plan.name}`}
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

      {paidPlan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Secure checkout</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Upgrade to {paidPlan.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedPlan(null)} disabled={isBusy} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {paymentStatus === "success" ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
                <p className="mt-4 text-lg font-bold text-slate-900">Plan activated successfully</p>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="mt-7">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="customer-phone">Phone number</label>
                <p className="mt-1 text-xs leading-5 text-slate-500">Required by Cashfree to create a secure order.</p>
                <div className="relative mt-3">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="customer-phone"
                    type="tel"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="9876543210"
                    disabled={isBusy}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                {!cashfreeReady && <p className="mt-3 text-xs text-amber-600">Preparing secure checkout...</p>}
                {paymentStatus === "pending" && <p className="mt-3 text-xs text-amber-600">Your payment is being verified.</p>}
                {paymentStatus === "failed" && <p className="mt-3 text-xs text-red-600">Payment failed. Please check your details and try again.</p>}
                <button type="submit" disabled={isBusy || !cashfreeReady} className="interactive-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {isBusy && <Loader2 size={17} className="animate-spin" />}
                  {paymentStatus === "processing" ? "Processing your payment..." : paymentStatus === "preparing" ? "Preparing secure checkout..." : "Continue to Cashfree"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
