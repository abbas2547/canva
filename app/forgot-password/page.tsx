"use client";

import {
  useState,
} from "react";


import {
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  auth,
} from "@/firebase/firebase";

import toast from "react-hot-toast";

export default function ForgotPasswordPage() {

  const [email, setEmail] =
    useState("");

  const handleReset =
    async () => {

      try {

        await sendPasswordResetEmail(
          auth,
          email
        );

        toast.success(
          "Reset email sent"
        );

      } catch (error: any) {

        toast.error(
          error.message
        );
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">

        <h1 className="text-3xl font-bold mb-6">
          Reset Password
        </h1>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="w-full px-4 py-4 rounded-xl bg-slate-900 border border-slate-700 mb-4"
        />

        <button
          onClick={
            handleReset
          }
          className="w-full py-4 rounded-xl bg-indigo-600"
        >
          Send Reset Email
        </button>

      </div>

    </div>
  );
}