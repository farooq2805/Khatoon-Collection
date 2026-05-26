// components/products/Pagination.tsx
"use client";

import React from "react";

type Props = {
  page: number;
  totalPages: number;
  onChange: (p: number) => void; // ✅ match page.tsx usage
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages);

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  const btnBase = "h-10 min-w-10 px-3 rounded-xl border text-sm transition";
  const active = "bg-[#f57bb4] text-white border-[#f57bb4]";
  const normal = "bg-white text-gray-800 border-gray-200 hover:border-[#f57bb4]";

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        className={`${btnBase} ${normal}`}
        onClick={() => onChange(clamp(page - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button className={`${btnBase} ${normal}`} onClick={() => onChange(1)}>
            1
          </button>
          <span className="px-1 text-gray-400">…</span>
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${btnBase} ${p === page ? active : normal}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          <span className="px-1 text-gray-400">…</span>
          <button className={`${btnBase} ${normal}`} onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className={`${btnBase} ${normal}`}
        onClick={() => onChange(clamp(page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
