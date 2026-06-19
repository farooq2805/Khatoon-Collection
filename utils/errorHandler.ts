/**
 * Utility to report frontend system errors (SSR/Client) to the backend API.
 */
export async function reportSystemError(
  source: string,
  error: any,
  additionalInfo: Record<string, any> = {}
) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.khatooncollection.in/api";
  const url = `${apiBase}/errors/report`;

  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const payload = {
    source: `Frontend: ${source}`,
    error: {
      message: errorMsg,
      stack: errorStack,
    },
    additionalInfo: {
      url: typeof window !== "undefined" ? window.location.href : "SSR Context",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Node Server",
      ...additionalInfo,
    },
  };

  console.error(`[Frontend Error][${source}]:`, error);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Failed to send error report: Status ${res.status}`);
    }
  } catch (reportingErr) {
    console.error("Failed to report error to backend API:", reportingErr);
  }
}
