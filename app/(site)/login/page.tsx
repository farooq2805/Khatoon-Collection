/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import {
  loginUser,
  resendVerification,
  loginWithGoogle,
} from "@/lib/auth";

import { useAuth } from "@/context/AuthContext";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function extractErrorMessage(
  e: any,
  fallback: string
) {
  if (
    e?.message &&
    typeof e.message === "string"
  ) {
    return e.message;
  }

  if (typeof e === "string") {
    return e;
  }

  if (e?.details?.message) {
    return e.details.message;
  }

  return fallback;
}

function LoginContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const nextUrl =
    searchParams.get("next");

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showResend, setShowResend] =
    useState(false);

  const normalizedEmail = useMemo(
    () => email.trim().toLowerCase(),
    [email]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gsi-client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1008719970978-gp2e211952157df455gps4ww.apps.googleusercontent.com";

    const handleGoogleCallback = async (response: any) => {
      const idToken = response.credential;
      if (!idToken) return;

      setLoading(true);
      try {
        const res = await loginWithGoogle(idToken);
        if (!res?.data?.success) {
          throw new Error(res?.data?.message || "Google Sign-In failed");
        }

        const tokenVal = res?.data?.data?.token;
        const userVal = res?.data?.data?.user;

        if (!tokenVal) {
          throw new Error("Missing token from server");
        }

        login(userVal?.email || userVal?.firstName || "", tokenVal);
        toast.success("Google Sign-In successful 🎉");

        setTimeout(() => {
          router.push(nextUrl || "/account");
        }, 700);
      } catch (err: any) {
        toast.error(extractErrorMessage(err, "Google Sign-In failed"));
      } finally {
        setLoading(false);
      }
    };

    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
        });

        const container = document.getElementById("google-login-btn");
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: "380",
          });
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [nextUrl, login, router]);

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (loading) return;

    setShowResend(false);

    if (!normalizedEmail) {
      toast.error(
        "Email is required"
      );
      return;
    }

    if (
      !isEmail(normalizedEmail)
    ) {
      toast.error(
        "Please enter valid email"
      );
      return;
    }

    if (!password) {
      toast.error(
        "Password is required"
      );
      return;
    }

    setLoading(true);

    try {
      const res =
        await loginUser({
          email: normalizedEmail,
          password,
        });

      if (
        !res?.data?.success
      ) {
        throw new Error(
          res?.data?.message ||
            "Login failed"
        );
      }

      const token =
        res?.data?.data?.token;

      const user =
        res?.data?.data?.user;

      if (!token) {
        throw new Error(
          "Missing token from server"
        );
      }

      login(
        user?.email ||
          normalizedEmail,
        token
      );

      toast.success(
        "Login successful 🎉"
      );

      setTimeout(() => {
        const guestCart = localStorage.getItem("guestCart");
        let hasCart = false;
        try {
          if (guestCart && JSON.parse(guestCart).length > 0) {
            hasCart = true;
          }
        } catch {}

        router.push(
          nextUrl || (hasCart ? "/checkout" : "/account")
        );
      }, 700);
    } catch (e: any) {
      const message =
        extractErrorMessage(
          e,
          "Login failed"
        );

      toast.error(message);

      if (
        message
          .toLowerCase()
          .includes(
            "verify your email"
          )
      ) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (
      !normalizedEmail ||
      !isEmail(
        normalizedEmail
      )
    ) {
      toast.error(
        "Enter valid email first"
      );
      return;
    }

    setLoading(true);

    try {
      const res =
        await resendVerification(
          normalizedEmail
        );

      if (
        !res?.data?.success
      ) {
        throw new Error(
          res?.data?.message ||
            "Failed to resend"
        );
      }

      toast.success(
        res.data.message ||
          "Verification email sent"
      );
    } catch (e: any) {
      toast.error(
        extractErrorMessage(
          e,
          "Failed to resend"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Login to your account
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-12 py-4 pr-12 outline-none focus:ring-2 focus:ring-pink-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

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
                "Login"
              )}
            </button>

            {showResend && (
              <button
                type="button"
                onClick={onResend}
                disabled={loading}
                className="w-full border border-pink-300 text-pink-600 hover:bg-pink-50 rounded-2xl py-3 transition"
              >
                Resend Verification Email
              </button>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <div id="google-login-btn"></div>
            </div>

            <div className="text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-pink-600 hover:text-pink-700"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
          <p className="text-gray-500 font-medium animate-pulse">Syncing your cart...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}