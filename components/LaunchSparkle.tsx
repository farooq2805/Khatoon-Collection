"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#FFD700", "#FF69B4", "#FF1493", "#FFC0CB",
  "#FFFFFF", "#FFE066", "#FF85C1", "#FFF0A0",
  "#F9A8D4", "#FBBF24",
];

const TOTAL_DURATION = 8000;
const SPAWN_INTERVAL = 60; // ms between batch spawns
const BATCH_SIZE = 8;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function createSparkleEl(): HTMLElement {
  const el = document.createElement("div");
  const size = randomBetween(6, 18);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const x = randomBetween(0, window.innerWidth);
  const y = randomBetween(0, window.innerHeight);
  const tx = randomBetween(-120, 120);
  const ty = randomBetween(-180, 40);
  const duration = randomBetween(1000, 2200);
  const delay = randomBetween(0, 200);
  const rotation = randomBetween(0, 360);
  const isSparkle = Math.random() > 0.4;

  el.style.cssText = `
    position: fixed;
    pointer-events: none;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    opacity: 0;
    z-index: 99999;
    transform-origin: center center;
  `;

  if (isSparkle) {
    // 4-point star using clip-path
    el.style.background = color;
    el.style.clipPath =
      "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)";
    el.style.filter = `drop-shadow(0 0 ${size / 2}px ${color})`;
  } else {
    el.style.borderRadius = "50%";
    el.style.background = color;
    el.style.boxShadow = `0 0 ${size}px ${size / 2}px ${color}`;
  }

  el.animate(
    [
      {
        transform: `translate(0, 0) rotate(${rotation}deg) scale(0)`,
        opacity: 0,
      },
      {
        transform: `translate(${tx * 0.3}px, ${ty * 0.3}px) rotate(${rotation + 90}deg) scale(1)`,
        opacity: 1,
        offset: 0.15,
      },
      {
        transform: `translate(${tx}px, ${ty}px) rotate(${rotation + 270}deg) scale(0.6)`,
        opacity: 0.7,
        offset: 0.7,
      },
      {
        transform: `translate(${tx * 1.2}px, ${ty * 1.4 + 60}px) rotate(${rotation + 360}deg) scale(0)`,
        opacity: 0,
      },
    ],
    {
      duration,
      delay,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      fill: "forwards",
    }
  ).onfinish = () => {
    el.remove();
  };

  return el;
}

export default function LaunchSparkle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Burst immediately with 60 particles
    for (let i = 0; i < 60; i++) {
      container.appendChild(createSparkleEl());
    }

    // Keep spawning every 60ms
    timerRef.current = setInterval(() => {
      for (let i = 0; i < BATCH_SIZE; i++) {
        container.appendChild(createSparkleEl());
      }
    }, SPAWN_INTERVAL);

    // Stop spawning after 6.5s, then remove container at 8s
    stopTimerRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        container.style.transition = "opacity 0.5s ease";
        container.style.opacity = "0";
        setTimeout(() => container.remove(), 600);
      }, 1500);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}
