"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { Sparkles, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
      toast.success("Reset email sent! Check your inbox.");
    } catch (error) {
      const message = (error as Error).message || "Failed to send reset email";
      if (message.includes("not-found") || message.includes("user-not-found")) {
        toast.error("No account found with this email");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_0.8px,transparent_0.8px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f172a]/70 border border-slate-800/80 rounded-[32px] p-8 backdrop-blur-2xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4 text-indigo-400">
            {sent ? <CheckCircle size={24} /> : <Sparkles size={24} />}
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {sent ? "Email Sent" : "Reset Password"}
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {sent
              ? `We've sent a password reset link to ${email}`
              : "Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        {!sent ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReset();
                    }}
                    placeholder="you@example.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Send Reset Email"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="w-full bg-slate-800 border border-slate-700 text-white font-semibold py-3 rounded-2xl hover:bg-slate-700 transition"
            >
              Try another email
            </button>
          </div>
        )}

        <p className="text-center text-slate-400 text-sm mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Sign in
          </Link>
        </p>

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mt-4 text-slate-500 hover:text-slate-300 text-sm transition"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
