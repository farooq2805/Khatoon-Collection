/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

type Options = {
  enabled?: boolean;
  ease?: number; // 0.06 - 0.14 good range
  maxStep?: number; // limits huge trackpad spikes
};

export default function useSmoothWheelScroll(options: Options = {}) {
  const { enabled = true, ease = 0.085, maxStep = 160 } = options;

  const currentY = useRef(0);
  const targetY = useRef(0);
  const rafId = useRef<number | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // init to current scroll
    currentY.current = window.scrollY || 0;
    targetY.current = window.scrollY || 0;

    const clampTarget = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (targetY.current < 0) targetY.current = 0;
      if (targetY.current > max) targetY.current = max;
    };

    const animate = () => {
      // smooth approach
      const diff = targetY.current - currentY.current;
      currentY.current += diff * ease;

      window.scrollTo(0, currentY.current);

      if (Math.abs(diff) > 0.5) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        // snap end
        currentY.current = targetY.current;
        window.scrollTo(0, targetY.current);
        rafId.current = null;
        isRunning.current = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // allow CTRL+wheel zoom, and horizontal scroll
      if (e.ctrlKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // smooth only vertical scrolling
      const step = Math.max(-maxStep, Math.min(maxStep, e.deltaY));
      targetY.current += step;
      clampTarget();

      if (!isRunning.current) {
        isRunning.current = true;
        rafId.current = requestAnimationFrame(animate);
      }
    };

    const onScroll = () => {
      // if user drags scrollbar or uses keyboard,
      // sync internal refs so it doesn't "fight" user
      if (!isRunning.current) {
        currentY.current = window.scrollY || 0;
        targetY.current = window.scrollY || 0;
      }
    };

    const onResize = () => clampTarget();

    // IMPORTANT: passive true so it feels responsive
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onResize as any);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, ease, maxStep]);
}
