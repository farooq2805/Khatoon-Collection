"use client";

import React, { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * Checks if a URL is from the old disabled Cloudinary account (techsrow).
 * These return a 401 JSON response, not an image.
 */
function isBrokenCloudinaryUrl(src?: string): boolean {
  if (!src) return true;
  // Old disabled account — always broken
  if (src.includes("res.cloudinary.com/techsrow")) return true;
  return false;
}

export default function SafeImage({
  src,
  alt = "Khatoon Collection",
  fallbackSrc = "/logo.png",
  className = "",
  ...props
}: SafeImageProps) {
  const [errored, setErrored] = useState<boolean>(() => isBrokenCloudinaryUrl(src));

  useEffect(() => {
    setErrored(isBrokenCloudinaryUrl(src));
  }, [src]);

  if (errored || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-neutral-100 p-4 border border-pink-100/50 select-none ${className}`}
        style={{ minHeight: 80 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt={alt}
          className="max-h-[60%] max-w-[70%] object-contain opacity-85"
        />
        <span className="mt-2 text-[10px] font-bold text-pink-700 uppercase tracking-widest text-center opacity-75">
          {alt || "Khatoon Collection"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
