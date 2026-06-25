/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

function extractErrorMessage(e: any, fallback: string) {
  if (e?.message && typeof e.message === "string") return e.message;
  if (typeof e === "string") return e;
  if (e?.details?.message) return e.details.message;
  return fallback;
}

export default function ResetPasswordClient() {
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!token) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirm) return false;
    return true;
  }, [token, newPassword, confirm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setMsg(null);

    if (!token) return setErr("Missing reset token. Please use the link from your email.");
    if (newPassword.length < 6) return setErr("Password must be at least 6 characters.");
    if (newPassword !== confirm) return setErr("Passwords do not match.");

    setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword });
      if (!res?.data?.success) throw new Error(res?.data?.message || "Reset failed");
      setMsg(res.data.message || "Password updated successfully.");
      setNewPassword("");
      setConfirm("");
    } catch (e: any) {
      setErr(extractErrorMessage(e, "Reset failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-500 mt-2">Set a new password for your account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{err}</div>}
            {msg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{msg}</div>}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Reset Password"
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
