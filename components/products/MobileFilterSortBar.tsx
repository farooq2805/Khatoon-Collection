"use client";

import React from "react";
import { FiX, FiChevronDown, FiSliders } from "react-icons/fi";

type SectionKey =
  | "size"
  | "colors"
  | "category"
  | "fabric"
  | "occasion"
  | "pattern"
  | "price"
  | "style"
  | "sleeve"
  | "neck";

const FILTER_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "size", label: "SIZE" },
  { key: "colors", label: "COLORS" },
  { key: "category", label: "CATEGORY" },
  { key: "fabric", label: "FABRIC" },
  { key: "occasion", label: "OCCASION" },
  { key: "pattern", label: "PATTERN AND PRINT" },
  { key: "price", label: "PRICE" },
  { key: "style", label: "STYLE" },
  { key: "sleeve", label: "SLEEVE LENGTH" },
  { key: "neck", label: "NECK" },
];

type Props = {
  /** Optional: open callbacks so you can connect your existing filter logic */
  onOpenFilter?: () => void;
  onOpenSort?: () => void;

  /** Optional: use to apply your sort */
  sortValue?: string;
  onChangeSort?: (value: string) => void;
};

export default function MobileFilterSortBar({
  onOpenFilter,
  onOpenSort,
  sortValue,
  onChangeSort,
}: Props) {
  const [open, setOpen] = React.useState<"filter" | "sort" | null>(null);

  const close = () => setOpen(null);

  return (
    <>
      {/* ===== Bottom bar (exact two buttons) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] border-t bg-white">
        <div className="grid grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setOpen("filter");
              onOpenFilter?.();
            }}
            className="flex h-12 items-center justify-center gap-2 border-r text-[12px] font-semibold tracking-[0.22em] text-black"
          >
            <FiSliders className="text-black/80" />
            FILTER
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen("sort");
              onOpenSort?.();
            }}
            className="flex h-12 items-center justify-center gap-2 text-[12px] font-semibold tracking-[0.22em] text-black"
          >
            <span className="text-black/70">⇅</span>
            SORT
          </button>
        </div>
      </div>

      {/* ===== Overlay + Panel ===== */}
      {open ? (
        <div className="fixed inset-0 z-[1000]">
          {/* Backdrop */}
          <button
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/20"
          />

          {/* Panel */}
          <div className="absolute inset-x-0 top-0 h-[92vh] bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-[18px] font-semibold text-black">
                {open === "filter" ? "Filter" : "Sort"}
              </div>
              <button
                type="button"
                onClick={close}
                className="grid h-10 w-10 place-items-center rounded-full"
                aria-label="Close"
              >
                <FiX className="text-black/70" size={22} />
              </button>
            </div>

            <div className="border-t" />

            {/* Body */}
            <div className="max-h-[calc(92vh-72px)] overflow-y-auto">
              {open === "filter" ? (
                <FilterList />
              ) : (
                <SortList sortValue={sortValue} onChangeSort={onChangeSort} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-5 text-left"
    >
      <span className="text-[13px] font-semibold tracking-[0.28em] text-black">
        {label}
      </span>
      <FiChevronDown className="text-black/60" />
    </button>
  );
}

function FilterList() {
  return (
    <div className="divide-y divide-black/10">
      {FILTER_SECTIONS.map((s) => (
        <div key={s.key}>
          <Row label={s.label} onClick={() => {}} />
          {/* you can expand each section here later */}
        </div>
      ))}
    </div>
  );
}

function SortList({
  sortValue,
  onChangeSort,
}: {
  sortValue?: string;
  onChangeSort?: (value: string) => void;
}) {
  const options = [
    { value: "popular", label: "Popularity" },
    { value: "new", label: "New Arrivals" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
  ];

  return (
    <div className="divide-y divide-black/10">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChangeSort?.(o.value)}
          className="flex w-full items-center justify-between px-4 py-5 text-left"
        >
          <span className="text-[13px] font-medium text-black">{o.label}</span>
          {sortValue === o.value ? (
            <span className="text-[12px] font-semibold text-black">✓</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
