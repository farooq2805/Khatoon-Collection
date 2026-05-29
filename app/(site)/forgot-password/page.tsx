/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function extractErrorMessage(e: any, fallback: string) {
  if (e?.message && typeof e.message === "string") return e.message;
  if (typeof e === "string") return e;
  if (e?.details?.message) return e.details.message;
  return fallback;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setMsg(null);

    if (!normalizedEmail) return setErr("Email is required.");
    if (!isEmail(normalizedEmail)) return setErr("Enter a valid email address.");

    setLoading(true);
    try {
      const res = await forgotPassword(normalizedEmail);
      if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to send reset link");
      setMsg(res.data.message || "If the email exists, a reset link was sent.");
    } catch (e: any) {
      setErr(extractErrorMessage(e, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="text-sm text-gray-500 mt-1">Enter your email and we’ll send a reset link.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-green-700">{msg}</div>}

        <button disabled={loading} className="w-full rounded bg-black text-white py-2 disabled:opacity-60">
          {loading ? "Please wait..." : "Send reset link"}
        </button>

        <p className="text-sm text-gray-600">
          Back to <Link className="underline" href="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
