/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";

export default function ZoomModal({
  open,
  image,
  title,
  onClose,
}: {
  open: boolean;
  image: string;
  title: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1.0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    setScale(1.0);
    setPos({ x: 0, y: 0 });
  }, [open, image]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const zoomIn = () => setScale((s) => clamp(Number((s + 0.3).toFixed(2)), 1, 4));
  const zoomOut = () => setScale((s) => clamp(Number((s - 0.3).toFixed(2)), 1, 4));

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/90">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 text-white">
        <div className="text-sm font-semibold line-clamp-1">{title}</div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
          aria-label="Close zoom"
        >
          <FiX />
        </button>
      </div>

      <div className="absolute left-0 right-0 top-14 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Zoom out"
        >
          <FiMinus />
        </button>
        <div className="text-white text-xs">{Math.round(scale * 100)}%</div>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Zoom in"
        >
          <FiPlus />
        </button>
      </div>

      <div
        className="absolute inset-0 top-24 flex items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <div className="relative h-[78vh] w-[92vw] max-w-5xl overflow-hidden rounded-lg bg-black">
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-contain"
            draggable={false}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center text-xs text-white/70">
        Drag to pan • Use + / - to zoom
      </div>
    </div>
  );
}
