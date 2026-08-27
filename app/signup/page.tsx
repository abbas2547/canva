"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

function getSignupErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    default:
      return "We couldn't create your account. Please try again.";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading, signUpWithEmail } = useAuth();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password, name);
      toast.success("Welcome to Mini Canva!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(getSignupErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="page-transition min-h-screen bg-transparent text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-300/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/90 border border-slate-200 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_24px_70px_rgba(15,23,42,0.12)] relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-2xl mb-4 text-indigo-600">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Start your AI-powered design journey
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-[2px] ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-900 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] ml-1">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="interactive-button w-full py-4 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-sm shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
