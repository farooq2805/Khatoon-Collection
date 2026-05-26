/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth";

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
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="text-sm text-gray-500 mt-1">Set a new password for your account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          placeholder="New password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-green-700">{msg}</div>}

        <button
          disabled={loading || !canSubmit}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Reset password"}
        </button>

        <p className="text-sm text-gray-600">
          Back to{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
