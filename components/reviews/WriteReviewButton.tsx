"use client";

import { useState } from "react";
import WriteReviewModal from "./WriteReviewModal";

export default function WriteReviewButton({
  productId,
  productSlug,
}: {
  productId?: number;
  productSlug?: string;
}) {
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="rounded-xl bg-[#f57bb4] px-4 py-2 text-white hover:opacity-90"
      >
        Write a review
      </button>

      {open && (
        <WriteReviewModal
          productId={productId}
          productSlug={productSlug}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
