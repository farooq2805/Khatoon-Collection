/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

// Helper: parse API errors
async function parseError(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || `HTTP ${res.status}` };
  }
}

const api = {
  post: async (url: string, body: any, withAuth = true) => {
    let token: string | null = null;

    if (typeof window !== "undefined") {
      token = localStorage.getItem("token");
      if (token === "null" || token === "undefined") token = null;
    }

    // 🔥 Build headers dynamically
    const headers: any = {
      "Content-Type": "application/json",
    };

    // 🔥 ONLY add Authorization if: withAuth = true AND token exists
    if (withAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await parseError(res);
      throw new Error(err?.message || `Failed ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    return { data };
  },
};

export default api;
export { api };
