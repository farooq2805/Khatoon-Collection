/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/auth.ts

import { api } from "./api";
import type { MeDTO } from "./types";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type LoginPayload = { email: string; password: string };

export type LoginData = {
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
  };
};

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  return api.post<ApiEnvelope<LoginData>>("/auth/register", payload, { withAuth: false });
}

export async function resendVerification(email: string) {
  return api.post<ApiEnvelope>(
    "/auth/resend-verification",
    { email },
    { withAuth: false }
  );
}

export async function loginUser(payload: LoginPayload) {
  return api.post<ApiEnvelope<LoginData>>("/auth/login", payload, { withAuth: false });
}

export async function loginWithGoogle(idToken: string) {
  return api.post<ApiEnvelope<LoginData>>("/auth/google-login", { idToken }, { withAuth: false });
}

export async function verifyEmail(token: string) {
  return api.get<ApiEnvelope>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
    { withAuth: false }
  );
}

export async function forgotPassword(email: string) {
  return api.post<ApiEnvelope>(
    "/auth/password/forgot",
    { email },
    { withAuth: false }
  );
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  return api.post<ApiEnvelope>(
    "/auth/password/reset",
    payload,
    { withAuth: false }
  );
}

export async function getMe(): Promise<MeDTO> {
  const res = await api.get<ApiEnvelope<MeDTO>>("/auth/profile");
  if (!res.data.success) throw new Error(res.data.message || "Unauthorized");
  return res.data.data as MeDTO;
}


export function getToken(): string | null {
  if (typeof window === "undefined") return null; // server safe
  return localStorage.getItem("token"); // use your actual key
}
