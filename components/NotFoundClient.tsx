"use client";

import { useSearchParams } from "next/navigation";

export default function NotFoundClient() {
  const sp = useSearchParams(); // ok now
  const from = sp.get("from");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      {from ? <p className="mt-2 text-gray-600">From: {from}</p> : null}
    </div>
  );
}
