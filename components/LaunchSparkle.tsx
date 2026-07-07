"use client";

import { useEffect, useRef, useState } from "react";

// ─── Sparkle particle config ──────────────────────────────────────────────────
const COLORS = [
  "#FFD700", // gold
  "#FF69B4", // hot pink
  "#FF1493", // deep pink
  "#FFC0CB", // pink
  "#FFFFFF", // white flash
  "#FFE066", // champagne gold
  "#FF85C1", // soft pink
  "#FFFACD", // lemon chiffon
];

const DURATION_MS = 8000; // 8 seconds sparkle
const SPAWN_RATE = 6;     // new particles per frame
const MAX_PARTICLES = 600;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 0 → 1 (0 = alive, 1 = dead)
  decay: number;      // how fast it dies
  size: number;
  color: string;
  twinkle: number;    // twinkle phase offset
  shape: "star" | "circle" | "sparkle";
  rotation: number;
  rotSpeed: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function spawnParticle(W: number, H: number): Particle {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(1.5, 5.5);
  const shapes: Particle["shape"][] = ["star", "circle", "sparkle"];
  return {
    x: randomBetween(0, W),
    y: randomBetween(0, H),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - randomBetween(0.5, 2), // slight upward drift
    life: 0,
    decay: randomBetween(0.006, 0.018),
    size: randomBetween(3, 12),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    twinkle: randomBetween(0, Math.PI * 2),
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    rotation: randomBetween(0, Math.PI * 2),
    rotSpeed: randomBetween(-0.15, 0.15),
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) {
  const spikes = 5;
  const outerRadius = r;
  const innerRadius = r * 0.45;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes + rotation;
    const rad = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) {
  // 4-point cross sparkle (like ✦)
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2 + rotation;
    const angOff = Math.PI / 4 + rotation;
    const peak = r;
    const side = r * 0.15;
    if (i === 0) {
      ctx.moveTo(x + Math.cos(angOff + (i * Math.PI) / 2) * side, y + Math.sin(angOff + (i * Math.PI) / 2) * side);
    }
    ctx.quadraticCurveTo(x, y, x + Math.cos(ang) * peak, y + Math.sin(ang) * peak);
    ctx.quadraticCurveTo(x, y, x + Math.cos(angOff + ((i + 1) * Math.PI) / 2) * side, y + Math.sin(angOff + ((i + 1) * Math.PI) / 2) * side);
  }
  ctx.closePath();
  ctx.fill();
}

export default function LaunchSparkle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(true);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const opacityRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);

      // Fade out in last 1.5 seconds
      const fadeStart = DURATION_MS - 1500;
      if (elapsed > fadeStart) {
        opacityRef.current = Math.max(0, 1 - (elapsed - fadeStart) / 1500);
      } else {
        opacityRef.current = 1;
      }

      // Stop spawning new particles after 6.5s
      const spawning = elapsed < DURATION_MS - 1500;

      // Clear canvas
      ctx.clearRect(0, 0, W, H);

      // Spawn new particles
      if (spawning && particlesRef.current.length < MAX_PARTICLES) {
        for (let i = 0; i < SPAWN_RATE; i++) {
          particlesRef.current.push(spawnParticle(W, H));
        }
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter((p) => p.life < 1);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gentle gravity
        p.vx *= 0.99;
        p.life += p.decay;
        p.rotation += p.rotSpeed;

        const alpha = opacityRef.current * (1 - p.life) * (0.6 + 0.4 * Math.sin(p.twinkle + p.life * 20));
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.size, p.rotation);
        } else if (p.shape === "sparkle") {
          drawSparkle(ctx, p.x, p.y, p.size, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setVisible(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
