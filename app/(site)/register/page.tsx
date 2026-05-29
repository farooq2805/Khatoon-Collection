/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { registerUser, resendVerification } from "@/lib/auth";

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function cleanName(v: string) {
  return v.replace(/\s+/g, " ").trim();
}

function extractErrorMessage(e: any, fallback: string) {
  // Your api.ts throws ApiError { status, message, details }
  if (e?.message && typeof e.message === "string") return e.message;

  // Sometimes the error might be a string
  if (typeof e === "string") return e;

  // Sometimes nested details has message
  if (e?.details?.message) return e.details.message;

  return fallback;
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const normalized = useMemo(() => {
    const firstName = cleanName(form.firstName);
    const lastName = cleanName(form.lastName);
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.replace(/\s+/g, "").trim(); // remove spaces
    const password = form.password;
    return { firstName, lastName, email, phone, password };
  }, [form]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function validate(): string | null {
    const { firstName, lastName, email, phone, password } = normalized;

    if (!firstName) return "First name is required.";
    if (firstName.length < 2) return "First name must be at least 2 characters.";
    if (!/^[a-zA-Z\s.'-]+$/.test(firstName)) return "First name contains invalid characters.";

    if (!lastName) return "Last name is required.";
    if (lastName.length < 2) return "Last name must be at least 2 characters.";
    if (!/^[a-zA-Z\s.'-]+$/.test(lastName)) return "Last name contains invalid characters.";

    if (!email) return "Email is required.";
    if (!isEmail(email)) return "Enter a valid email address.";

    if (phone) {
      if (!INDIAN_PHONE_REGEX.test(phone)) {
        return "Invalid Indian mobile number (must start with 6/7/8/9 and be 10 digits).";
      }
    }

    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";

    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setMsg(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        firstName: normalized.firstName,
        lastName: normalized.lastName,
        email: normalized.email,
        phone: normalized.phone ? normalized.phone : undefined,
        password: normalized.password,
      });

      // ✅ Your api.ts returns: { data: parsedOrParsed.data }
      // We typed registerUser to return { success, message, data? } inside res.data
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Registration failed");
      }

      setRegisteredEmail(normalized.email);
      setMsg(res.data.message || "Registered successfully. Please verify your email.");

      // optional: clear password field only
      setForm((p) => ({ ...p, password: "" }));
    } catch (e: any) {
      setErr(extractErrorMessage(e, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!registeredEmail || loading) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await resendVerification(registeredEmail);

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to resend verification email");
      }

      setMsg(res.data.message || "Verification email sent.");
    } catch (e: any) {
      setErr(extractErrorMessage(e, "Failed to resend verification email"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="text-sm text-gray-500 mt-1">
        Register and verify your email to activate.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2"
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={onChange}
            autoComplete="given-name"
            required
          />
          <input
            className="border rounded px-3 py-2"
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={onChange}
            autoComplete="family-name"
            required
          />
        </div>

        <input
          className="border rounded px-3 py-2 w-full"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          required
        />

        <input
          className="border rounded px-3 py-2 w-full"
          name="phone"
          placeholder="Mobile (optional)"
          value={form.phone}
          onChange={onChange}
          inputMode="numeric"
          maxLength={10}
        />

        <input
          className="border rounded px-3 py-2 w-full"
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={form.password}
          onChange={onChange}
          autoComplete="new-password"
          required
        />

        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-green-700">{msg}</div>}

        <button
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Register"}
        </button>

        {registeredEmail && (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="w-full rounded border py-2 disabled:opacity-60"
          >
            Resend verification email
          </button>
        )}

        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
