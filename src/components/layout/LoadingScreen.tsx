"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// Each light: position on image (% of display size), color, and the % progress that turns it ON
// Positions calibrated from pixel analysis of pinheiro.png (1024×1536) rendered at 200×300
const LIGHTS = [
  // Orange row 1
  { top: 33.0, left: 29.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 0 },
  { top: 33.0, left: 71.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 0 },
  // Orange row 2
  { top: 40.0, left: 29.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 6 },
  { top: 40.0, left: 71.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 6 },
  // Orange row 3
  { top: 47.0, left: 29.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 12 },
  { top: 47.0, left: 71.0, color: "#f97316", shadow: "0 0 5px 2px #f97316, 0 0 10px 4px #ea580c33", threshold: 12 },
  // Green row 1
  { top: 54.0, left: 29.0, color: "#22c55e", shadow: "0 0 5px 2px #22c55e, 0 0 10px 4px #16a34a33", threshold: 18 },
  { top: 54.0, left: 71.0, color: "#22c55e", shadow: "0 0 5px 2px #22c55e, 0 0 10px 4px #16a34a33", threshold: 18 },
  // Green row 2
  { top: 60.5, left: 29.0, color: "#22c55e", shadow: "0 0 5px 2px #22c55e, 0 0 10px 4px #16a34a33", threshold: 24 },
  { top: 60.5, left: 71.0, color: "#22c55e", shadow: "0 0 5px 2px #22c55e, 0 0 10px 4px #16a34a33", threshold: 24 },
  // Red row
  { top: 67.0, left: 29.0, color: "#dc2626", shadow: "0 0 5px 2px #dc2626, 0 0 10px 4px #b9191933", threshold: 35 },
  { top: 67.0, left: 71.0, color: "#dc2626", shadow: "0 0 5px 2px #dc2626, 0 0 10px 4px #b9191933", threshold: 35 },
] as const;

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const DURATION = 3000; // 3 segundos

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // 100% reached → begin exit after a short hold
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => setGone(true), 700);
        }, 400);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (gone) return null;

  const logoProgress = progress >= 80 ? (progress - 80) / 20 : 0; // 0→1 during 80–100%
  const logoBlur = Math.round((1 - logoProgress) * 30); // 30px → 0px
  const smokeOpacity = 1 - logoProgress; // smoke fades out

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0px",
        transition: exiting ? "opacity 0.7s ease" : "none",
        opacity: exiting ? 0 : 1,
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* ── Christmas Tree — 20% maior ── */}
      <div style={{ position: "relative", width: 240, height: 360 }}>
        <Image
          src="/pinheiro.png"
          alt="Semáforo de arrancada"
          fill
          sizes="240px"
          style={{ objectFit: "contain", zIndex: 1 }}
          priority
        />

        {/* Light glows — proportionally scaled up */}
        {LIGHTS.map((light, i) => {
          const on = progress >= light.threshold;
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                top: `${light.top}%`,
                left: `${light.left}%`,
                transform: "translate(-50%, -50%)",
                width: on ? 10 : 7,
                height: on ? 10 : 7,
                borderRadius: "50%",
                background: on ? light.color : "transparent",
                boxShadow: on ? light.shadow : "none",
                opacity: on ? 1 : 0,
                transition: "all 0.18s ease-out",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
          );
        })}
      </div>

      {/* ── Logo reveal ── */}
      <div
        style={{
          position: "relative",
          marginTop: 28,
          opacity: logoProgress,
          transition: "opacity 0.1s linear",
        }}
      >
        {/* Smoke layers */}
        <div
          style={{
            position: "absolute",
            inset: "-20px -40px",
            background: "radial-gradient(ellipse at center, #000 0%, transparent 70%)",
            opacity: smokeOpacity * 0.95,
            filter: `blur(${Math.round(smokeOpacity * 14)}px)`,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-10px -20px",
            background: "radial-gradient(ellipse at 40% 60%, #111 0%, transparent 60%)",
            opacity: smokeOpacity * 0.7,
            filter: `blur(${Math.round(smokeOpacity * 8)}px)`,
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        {/* Logo — fedullo.png, correct 600×350 aspect ratio */}
        <div style={{ position: "relative", zIndex: 4, filter: `blur(${logoBlur / 3}px)` }}>
          <Image
            src="/fedullo.png"
            alt="Fedullo"
            width={600}
            height={350}
            style={{ width: 220, height: "auto", display: "block" }}
            priority
          />
        </div>
      </div>

      {/* Progress bar — subtle, at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          width: `${progress}%`,
          background: "linear-gradient(90deg, #dc2626, #f97316)",
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
