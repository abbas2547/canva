"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, LogOut, Trash2, Check, X, CreditCard, Calendar, ShieldCheck, ExternalLink, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebaseClient";

interface PaymentRecord {
  orderId: string;
  planName: string;
  planId: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string | null;
}

export default function ProfilePage() {
  const { user, loading, logout, updateProfile, subscriptionPlan, subscriptionLoading } = useAuth();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadPayments = async () => {
      setPaymentsLoading(true);
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const response = await fetch("/api/account/payments", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json() as { payments?: PaymentRecord[]; error?: string };
        if (!response.ok) throw new Error(data.error || "Unable to load payment history.");
        if (!cancelled) setPayments(data.payments || []);
      } catch (error) {
        if (!cancelled) setPaymentsError(error instanceof Error ? error.message : "Unable to load payment history.");
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    };
    void loadPayments();
    return () => { cancelled = true; };
  }, [user?.uid]);

  // Initialize form data from user on first render only
  useEffect(() => {
    // This effect runs after initial render when user is available
    // We set formData displayName but avoid set-state-in-effect by
    // only running this once when user changes from null to a value
  }, [user]);

  // Save profile
  const handleSaveProfile = async () => {
    const displayName = formData.displayName.trim();

    if (!displayName) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        displayName,
      });

      toast.success("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({
      displayName: user?.displayName || "",
    });

    setEditMode(false);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-slate-600 border-t-indigo-500 animate-spin" />
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // User isn't authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="page-transition min-h-screen bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Account Settings
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your profile and account settings.
          </p>
        </div>

        {/* Profile Information */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-950">
            Profile Information
          </h2>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                <Mail className="h-5 w-5 shrink-0 text-slate-400" />

                <span className="truncate">
                  {user.email || "No email available"}
                </span>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Display Name
              </label>

              {editMode ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({
                        displayName: e.target.value,
                      })
                    }
                    placeholder="Enter your display name"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="interactive-button flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="h-5 w-5" />

                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-5 w-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-700">
                    {user.displayName || "Not set"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Subscription */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Current Plan
              </label>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-medium capitalize text-slate-900">{subscriptionPlan}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    {subscriptionLoading ? "Refreshing subscription status..." : "Current account plan"}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${subscriptionPlan === "business" ? "bg-amber-100 text-amber-700" : subscriptionPlan === "pro" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
                  {subscriptionPlan}
                </span>
              </div>
              <button type="button" onClick={() => router.push("/pricing")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                {subscriptionPlan === "free" ? "Upgrade plan" : "Manage subscription"} <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100"><CreditCard className="text-indigo-600" size={20} /></div>
              <div><h2 className="text-xl font-bold text-slate-950">Payments</h2><p className="text-sm text-slate-500">Trusted payment records for your account.</p></div>
            </div>
            {paymentsLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-600" size={24} /></div> : paymentsError ? <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{paymentsError}</p> : payments.length === 0 ? <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No payment history yet.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Plan</th><th className="pb-3 pr-4">Order ID</th><th className="pb-3 text-right">Amount</th><th className="pb-3 text-right">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.orderId} className="border-b border-slate-50 last:border-0"><td className="py-3 pr-4 text-slate-600">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}</td><td className="py-3 pr-4 font-medium capitalize text-slate-800">{payment.planName}</td><td className="max-w-[180px] truncate py-3 pr-4 font-mono text-xs text-slate-500">{payment.orderId}</td><td className="py-3 text-right text-slate-700">{payment.currency} {payment.amount.toLocaleString()}</td><td className="py-3 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${payment.status === "active" ? "bg-emerald-100 text-emerald-700" : payment.status === "failed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{payment.status}</span></td></tr>)}</tbody></table></div>}
          </div>

          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100"><ShieldCheck className="text-emerald-600" size={20} /></div>
              <div><h2 className="text-xl font-bold text-slate-950">Subscription status</h2><p className="text-sm text-slate-500">{subscriptionPlan === "free" ? "You are currently using the free plan." : "Your subscription is active through verified payment records."}</p></div>
            </div>
            {payments.find((payment) => payment.status === "active")?.createdAt && <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Calendar size={14} /> Last successful payment: {new Date(payments.find((payment) => payment.status === "active")!.createdAt!).toLocaleDateString()}</p>}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6">
        <h2 className="mb-2 text-xl font-semibold text-red-700">
            Danger Zone
          </h2>

          <p className="mb-5 text-sm text-slate-400">
            These actions affect your account. Please use them carefully.
          </p>

          <div className="space-y-3">
            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 font-medium text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Delete Account
              </h3>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-6 text-sm leading-6 text-slate-400">
              This action cannot be undone. Your account and associated data
              may be permanently deleted.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg bg-slate-700 px-4 py-2.5 font-medium text-white transition hover:bg-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.error("Account deletion is not implemented yet.");
                  setShowDeleteModal(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
