/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/auth";
import { Mail, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                />
              </div>
            </div>

            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{err}</div>}
            {msg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{msg}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center text-gray-600">
              Back to{" "}
              <Link className="font-semibold text-pink-600 hover:text-pink-700" href="/login">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
