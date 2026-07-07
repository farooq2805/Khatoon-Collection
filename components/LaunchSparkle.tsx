"use client";

import { useEffect, useRef, useState } from "react";

// ── Premium gold palette only ──────────────────────────────────────────────
const GOLD_COLORS = [
  "#FFD700", // classic gold
  "#FBBF24", // warm gold
  "#F59E0B", // amber gold
  "#FDE68A", // light gold
  "#FFE566", // champagne
  "#FFFACD", // lemon-cream
  "#DAA520", // deep goldenrod
  "#FFF8DC", // cornsilk
  "#FFECB3", // pale gold
  "#FFFFFF", // white flash
];

const DURATION_MS = 8000;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;   // 0 → 1
  decay: number;
  twinkle: number;
  rotation: number;
  rotSpeed: number;
  type: "star4" | "star6" | "dot" | "ring";
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function spawnParticle(W: number, H: number): Particle {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(1, 5);
  const types: Particle["type"][] = ["star4", "star6", "dot", "ring"];
  return {
    x: rand(0, W),
    y: rand(0, H),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(1, 3),
    size: rand(4, 16),
    color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
    life: 0,
    decay: rand(0.005, 0.015),
    twinkle: rand(0, Math.PI * 2),
    rotation: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.12, 0.12),
    type: types[Math.floor(Math.random() * types.length)],
  };
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number, spikes: number,
  rotation: number
) {
  const inner = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes + rotation;
    const rad = i % 2 === 0 ? r : inner;
    i === 0
      ? ctx.moveTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad)
      : ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

export default function LaunchSparkle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [textPhase, setTextPhase] = useState<"in" | "hold" | "out">("in");
  const rafRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const startRef = useRef<number>(0);

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

    // Spawn initial burst
    for (let i = 0; i < 120; i++) particles.current.push(spawnParticle(W, H));

    startRef.current = performance.now();

    // Text phases
    setTimeout(() => setTextPhase("hold"), 600);
    setTimeout(() => setTextPhase("out"), 6800);

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const t = elapsed / DURATION_MS;

      // Fade overlay in last 1.5s
      const overlayOpacity =
        elapsed > DURATION_MS - 1500
          ? Math.max(0, 1 - (elapsed - (DURATION_MS - 1500)) / 1500)
          : 1;

      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(overlayOpacity);
      }

      // Spawn new particles during first 6.5s
      if (elapsed < DURATION_MS - 1500 && particles.current.length < 500) {
        for (let i = 0; i < 7; i++) particles.current.push(spawnParticle(W, H));
      }

      ctx.clearRect(0, 0, W, H);

      particles.current = particles.current.filter((p) => p.life < 1);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.99;
        p.life += p.decay;
        p.rotation += p.rotSpeed;

        const alpha =
          overlayOpacity *
          (1 - p.life) *
          (0.7 + 0.3 * Math.sin(p.twinkle + p.life * 18));

        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#FFD700";
        ctx.shadowBlur = p.size * 2.5;

        if (p.type === "star4") {
          drawStar(ctx, p.x, p.y, p.size, 4, p.rotation);
        } else if (p.type === "star6") {
          drawStar(ctx, p.x, p.y, p.size * 0.8, 6, p.rotation);
        } else if (p.type === "ring") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setVisible(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!visible) return null;

  // ── text animation styles ──────────────────────────────────────────────
  const textStyle: React.CSSProperties = {
    transform:
      textPhase === "in"
        ? "scale(0.7) translateY(20px)"
        : textPhase === "out"
        ? "scale(0.95) translateY(-10px)"
        : "scale(1) translateY(0)",
    opacity: textPhase === "in" ? 0 : textPhase === "out" ? 0 : 1,
    transition:
      textPhase === "in"
        ? "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease"
        : "transform 0.5s ease, opacity 0.5s ease",
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: "none",
        background:
          "linear-gradient(160deg, #f0f0f0 0%, #ffffff 40%, #f5f5f5 70%, #ececec 100%)",
      }}
    >
      {/* Canvas sparkles */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Centered text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          ...textStyle,
        }}
      >
        {/* Gold decorative line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div style={{ width: 50, height: 1.5, background: "linear-gradient(90deg, transparent, #B8860B)" }} />
          <span style={{ fontSize: 22, filter: "drop-shadow(0 0 8px #FFD700)" }}>✦</span>
          <div style={{ width: 50, height: 1.5, background: "linear-gradient(90deg, #B8860B, transparent)" }} />
        </div>

        {/* Main headline */}
        <div
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
            letterSpacing: "0.06em",
            lineHeight: 1.15,
            textAlign: "center",
            background: "linear-gradient(135deg, #B8860B 0%, #FFD700 35%, #FBBF24 55%, #DAA520 75%, #FFD700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 2px 12px rgba(218,165,32,0.45))",
            padding: "0 20px",
          }}
        >
          We Are Live!
        </div>

        {/* Brand name */}
        <div
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 500,
            fontSize: "clamp(0.75rem, 2vw, 1rem)",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#9A7D0A",
            marginTop: 4,
          }}
        >
          Khatoon Collection
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, transparent, #B8860B)" }} />
          <span style={{ fontSize: 12, color: "#DAA520", letterSpacing: "0.2em" }}>✦ ✦ ✦</span>
          <div style={{ width: 30, height: 1, background: "linear-gradient(90deg, #B8860B, transparent)" }} />
        </div>
      </div>
    </div>
  );
}
