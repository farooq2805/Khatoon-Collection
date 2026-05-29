/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";

function extractErrorMessage(e: any, fallback: string) {
  if (e?.message && typeof e.message === "string") return e.message;
  if (typeof e === "string") return e;
  if (e?.details?.message) return e.details.message;
  return fallback;
}

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const token = sp.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token.");
        return;
      }

      try {
        const res = await verifyEmail(token);

        if (!res?.data?.success) {
          throw new Error(res?.data?.message || "Verification failed");
        }

        if (!alive) return;
        setStatus("success");
        setMessage(res.data.message || "Email verified. You can login now.");
      } catch (e: any) {
        if (!alive) return;
        setStatus("error");
        setMessage(extractErrorMessage(e, "Verification failed"));
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold">Email Verification</h1>
      <p className="mt-3 text-sm">{message}</p>

      {status === "success" && (
        <Link className="inline-block mt-6 rounded bg-black text-white px-4 py-2" href="/login">
          Go to Login
        </Link>
      )}

      {status === "error" && (
        <div className="mt-6 space-x-3">
          <Link className="inline-block rounded border px-4 py-2" href="/login">
            Go to Login
          </Link>
          <Link className="inline-block rounded border px-4 py-2" href="/register">
            Go to Register
          </Link>
        </div>
      )}
    </div>
  );
}
