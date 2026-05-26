"use client";
import React from "react";

interface SelectableButtonProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function SelectableButton({ label, selected, onSelect }: SelectableButtonProps) {
  return (
    <button
      onClick={onSelect}
      className={`px-4 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex-shrink-0
        ${selected ? "border-amber-400 bg-amber-400 text-black" : "border-gray-600 text-gray-300 hover:border-amber-400 hover:text-amber-400"}
      `}
    >
      {label}
    </button>
  );
}
