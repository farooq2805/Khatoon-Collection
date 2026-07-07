"use client";

import { useEffect, useRef, useState } from "react";

/* ── Gold colours only ─────────────────────────────────────────── */
const GOLDS = [
  "#FFD700","#FBBF24","#F59E0B","#FDE68A",
  "#FFE566","#FFFACD","#DAA520","#FFECB3","#FFFFFF",
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

type Shape = "star4" | "star6" | "circle" | "ring";

interface Sparkle {
  id: number;
  x: number;      // vw
  y: number;      // vh
  size: number;   // px
  color: string;
  tx: number;     // translate-x (px)
  ty: number;     // translate-y (px)
  dur: number;    // ms
  delay: number;  // ms
  rot: number;    // deg
  shape: Shape;
}

let _id = 0;
function makeSparkle(): Sparkle {
  return {
    id: _id++,
    x: rand(2, 98),
    y: rand(2, 98),
    size: rand(6, 20),
    color: pick(GOLDS),
    tx: rand(-150, 150),
    ty: rand(-200, 60),
    dur: rand(900, 2200),
    delay: rand(0, 300),
    rot: rand(0, 360),
    shape: pick<Shape>(["star4", "star6", "circle", "ring"]),
  };
}

/* Star SVG helper */
function StarSvg({ spikes, size, color }: { spikes: number; size: number; color: string }) {
  const r = size / 2;
  const inner = r * 0.42;
  const cx = r, cy = r;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : inner;
    pts.push(`${cx + Math.cos(ang) * rr},${cy + Math.sin(ang) * rr}`);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <polygon
        points={pts.join(" ")}
        fill={color}
        style={{ filter: `drop-shadow(0 0 ${size * 0.4}px ${color})` }}
      />
    </svg>
  );
}

function SparkleEl({ s }: { s: Sparkle }) {
  const innerSize = s.shape === "circle" ? s.size * 0.55 : s.size;
  return (
    <div
      style={{
        position: "absolute",
        left: `${s.x}vw`,
        top: `${s.y}vh`,
        width: s.size,
        height: s.size,
        transform: "translate(-50%,-50%)",
        animation: `kc-sparkle-rise ${s.dur}ms ease-out ${s.delay}ms both`,
        ["--tx" as string]: `${s.tx}px`,
        ["--ty" as string]: `${s.ty}px`,
        ["--rot" as string]: `${s.rot}deg`,
      }}
    >
      {s.shape === "star4" && <StarSvg spikes={4} size={innerSize} color={s.color} />}
      {s.shape === "star6" && <StarSvg spikes={6} size={innerSize} color={s.color} />}
      {s.shape === "circle" && (
        <div style={{
          width: innerSize, height: innerSize,
          borderRadius: "50%",
          background: s.color,
          boxShadow: `0 0 ${innerSize}px ${innerSize * 0.7}px ${s.color}`,
        }} />
      )}
      {s.shape === "ring" && (
        <div style={{
          width: innerSize, height: innerSize,
          borderRadius: "50%",
          border: `2.5px solid ${s.color}`,
          boxShadow: `0 0 ${innerSize * 0.6}px ${s.color}`,
        }} />
      )}
    </div>
  );
}

export default function LaunchSparkle() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const [gone, setGone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Initial burst
    const initial: Sparkle[] = [];
    for (let i = 0; i < 80; i++) initial.push(makeSparkle());
    setSparkles(initial);
    setTimeout(() => setPhase("show"), 50);

    // Keep spawning every 120ms
    intervalRef.current = setInterval(() => {
      setSparkles((prev) => {
        const next = prev.filter((s) => s.id > _id - 300); // keep recent
        for (let i = 0; i < 10; i++) next.push(makeSparkle());
        return next;
      });
    }, 120);

    // Stop new spawns at 6.5s, start exit
    const t1 = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase("exit");
    }, 6500);

    // Remove completely at 8.5s
    const t2 = setTimeout(() => setGone(true), 8500);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <>
      {/* Keyframe definitions */}
      <style>{`
        @keyframes kc-sparkle-rise {
          0%   { transform: translate(-50%,-50%) translate(0,0) rotate(0deg) scale(0); opacity: 0; }
          15%  { opacity: 1; transform: translate(-50%,-50%) translate(calc(var(--tx)*0.2), calc(var(--ty)*0.2)) rotate(calc(var(--rot)*0.3)) scale(1.1); }
          60%  { opacity: .8; }
          100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
        }
        @keyframes kc-text-in {
          0%   { opacity:0; transform: scale(.75) translateY(28px); }
          60%  { transform: scale(1.04) translateY(-4px); }
          100% { opacity:1; transform: scale(1) translateY(0); }
        }
        @keyframes kc-text-out {
          0%   { opacity:1; transform: scale(1); }
          100% { opacity:0; transform: scale(.92) translateY(-14px); }
        }
        @keyframes kc-shimmer {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>

      {/* Full-screen overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          pointerEvents: "none",
          background: "linear-gradient(160deg,#efefef 0%,#ffffff 45%,#f4f4f4 75%,#e8e8e8 100%)",
          opacity: phase === "exit" ? 0 : 1,
          transition: phase === "exit" ? "opacity 1.8s ease" : "none",
          overflow: "hidden",
        }}
      >
        {/* Sparkle particles */}
        {sparkles.map((s) => <SparkleEl key={s.id} s={s} />)}

        {/* Centred launch text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            animation:
              phase === "exit"
                ? "kc-text-out 1s ease forwards"
                : phase === "show"
                ? "kc-text-in .8s cubic-bezier(.34,1.56,.64,1) forwards"
                : "none",
          }}
        >
          {/* Top ornament */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:48, height:1.5, background:"linear-gradient(90deg,transparent,#B8860B)" }} />
            <span style={{ color:"#DAA520", fontSize:20, lineHeight:1, filter:"drop-shadow(0 0 6px #FFD700)" }}>✦</span>
            <div style={{ width:48, height:1.5, background:"linear-gradient(90deg,#B8860B,transparent)" }} />
          </div>

          {/* "We Are Live!" */}
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-playfair,Georgia,serif)",
              fontWeight: 700,
              fontSize: "clamp(2.4rem,8vw,5rem)",
              letterSpacing: "0.06em",
              lineHeight: 1.1,
              textAlign: "center",
              padding: "0 24px",
              background:
                "linear-gradient(270deg,#B8860B,#FFD700,#FFFACD,#FBBF24,#DAA520,#FFD700)",
              backgroundSize: "400% 400%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "kc-shimmer 3s ease infinite",
              filter: "drop-shadow(0 3px 16px rgba(218,165,32,.5))",
            }}
          >
            We Are Live!
          </h1>

          {/* Brand subtitle */}
          <p
            style={{
              margin: "14px 0 0",
              fontFamily: "var(--font-montserrat,sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(.7rem,2vw,.95rem)",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#9A7D0A",
            }}
          >
            Khatoon&nbsp;Collection
          </p>

          {/* Bottom dots */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:20 }}>
            <div style={{ width:28, height:1, background:"linear-gradient(90deg,transparent,#B8860B)" }} />
            <span style={{ color:"#DAA520", fontSize:11, letterSpacing:"0.25em" }}>✦ ✦ ✦</span>
            <div style={{ width:28, height:1, background:"linear-gradient(90deg,#B8860B,transparent)" }} />
          </div>
        </div>
      </div>
    </>
  );
}
