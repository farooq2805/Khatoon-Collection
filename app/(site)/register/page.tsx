/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { registerUser, resendVerification } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function cleanName(v: string) {
  return v.replace(/\s+/g, " ").trim();
}

function extractErrorMessage(e: any, fallback: string) {
  if (e?.message && typeof e.message === "string") return e.message;
  if (typeof e === "string") return e;
  if (e?.details?.message) return e.details.message;
  return fallback;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Registration failed");
      }

      const tokenVal = res?.data?.data?.token;
      const userVal = res?.data?.data?.user;

      if (!tokenVal) throw new Error("Missing token from server");

      login(userVal?.email || normalized.email, tokenVal);
      toast.success("Account created and logged in successfully!");
      setMsg("Registration successful! Redirecting...");

      setTimeout(() => {
        const guestCart = localStorage.getItem("guestCart");
        let hasCart = false;
        try {
          if (guestCart && JSON.parse(guestCart).length > 0) {
            hasCart = true;
          }
        } catch {}

        router.push(hasCart ? "/checkout" : "/account");
      }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-2">Join us to start shopping</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition text-sm"
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={onChange}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition text-sm"
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={onChange}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                name="phone"
                placeholder="Mobile (optional)"
                value={form.phone}
                onChange={onChange}
                inputMode="numeric"
                maxLength={10}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 pr-12 outline-none focus:ring-2 focus:ring-pink-500 transition"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={onChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{err}</div>}
            {msg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{msg}</div>}

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Register"
              )}
            </button>

            {registeredEmail && (
              <button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="w-full border border-pink-300 text-pink-600 hover:bg-pink-50 rounded-2xl py-3 transition text-sm font-medium"
              >
                Resend verification email
              </button>
            )}

            <div className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
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
