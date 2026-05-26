"use client";

import React from "react";

export default function WhatsAppFloating() {
  return (
    <a
      href="https://wa.me/919867196860?text=Hi%20Khatoon%20Collection,%20I'm%20interested%20in%20your%20products!"
      target="_blank"
      rel="noopener noreferrer"
      className="
        fixed 
        z-[9999] 
        bottom-20 
        right-5 
        md:bottom-6 
        md:right-6 
        flex 
        items-center 
        justify-center 
        w-14 
        h-14 
        rounded-full 
        bg-[#25D366] 
        text-white 
        shadow-2xl 
        hover:bg-[#20ba5a] 
        hover:scale-110 
        transition-all 
        duration-300 
        group
        cursor-pointer
      "
      aria-label="Connect on WhatsApp"
    >
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75 group-hover:animate-none pointer-events-none" />

      {/* WhatsApp Icon (using RemixIcon) */}
      <i className="ri-whatsapp-line text-3xl relative z-10"></i>

      {/* Tooltip on hover */}
      <span className="
        absolute 
        right-16 
        bg-black/80 
        text-white 
        text-[11px] 
        font-medium 
        px-3 
        py-1.5 
        rounded-lg 
        shadow-md 
        whitespace-nowrap 
        opacity-0 
        translate-x-2 
        group-hover:opacity-100 
        group-hover:translate-x-0 
        transition-all 
        duration-300 
        pointer-events-none
        hidden
        md:inline
      ">
        Chat with us!
      </span>
    </a>
  );
}
