"use client";

import { FiStar } from "react-icons/fi";

export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-2xl"
        >
          <FiStar
            className={n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}
