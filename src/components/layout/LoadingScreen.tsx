"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// ─── Timings (ms) ─────────────────────────────────────────────────────────────
const LIGHTS_END   = 2000;   // lights sequence finishes
const FADE_START   = 2000;   // black overlay starts
const FADE_END     = 2450;   // fully black
const LOGO_IN      = 2500;   // logo starts appearing
const LOGO_PEAK    = 2850;   // logo fully visible
const LOGO_OUT     = 3400;   // logo starts fading
const LOGO_GONE    = 3750;   // logo invisible
const TV_START     = 3750;   // TV collapse begins
const TV_END       = 4250;   // TV fully collapsed → done

// ─── Christmas tree lights ─────────────────────────────────────────────────────
// Positions calibrated for the drag strip photo displayed with
// object-fit:cover + object-position:center 20% on a 16:9 desktop screen.
// top/left are % of VIEWPORT.
const LIGHTS = [
  // PRE-STAGE — small amber at the very top
  { top:  7.0, left: 48.4, color: "#fbbf24", bloom: "#fbbf24", ms:    0, size: 5 },
  { top:  7.0, left: 51.6, color: "#fbbf24", bloom: "#fbbf24", ms:    0, size: 5 },
  // STAGE
  { top: 11.5, left: 48.2, color: "#fbbf24", bloom: "#fbbf24", ms:  200, size: 5 },
  { top: 11.5, left: 51.8, color: "#fbbf24", bloom: "#fbbf24", ms:  200, size: 5 },
  // Yellow row 1
  { top: 18.5, left: 46.1, color: "#f59e0b", bloom: "#f59e0b", ms:  450, size: 8 },
  { top: 18.5, left: 53.9, color: "#f59e0b", bloom: "#f59e0b", ms:  450, size: 8 },
  // Yellow row 2
  { top: 25.5, left: 45.8, color: "#f59e0b", bloom: "#f59e0b", ms:  700, size: 8 },
  { top: 25.5, left: 54.2, color: "#f59e0b", bloom: "#f59e0b", ms:  700, size: 8 },
  // Yellow row 3
  { top: 32.5, left: 45.8, color: "#f59e0b", bloom: "#f59e0b", ms:  950, size: 8 },
  { top: 32.5, left: 54.2, color: "#f59e0b", bloom: "#f59e0b", ms:  950, size: 8 },
  // Green row 1
  { top: 41.0, left: 45.8, color: "#22c55e", bloom: "#22c55e", ms: 1250, size: 8 },
  { top: 41.0, left: 54.2, color: "#22c55e", bloom: "#22c55e", ms: 1250, size: 8 },
  // Green row 2
  { top: 48.0, left: 46.1, color: "#22c55e", bloom: "#22c55e", ms: 1550, size: 8 },
  { top: 48.0, left: 53.9, color: "#22c55e", bloom: "#22c55e", ms: 1550, size: 8 },
  // Red
  { top: 55.0, left: 47.3, color: "#ef4444", bloom: "#ef4444", ms: 1820, size: 8 },
  { top: 55.0, left: 52.7, color: "#ef4444", bloom: "#ef4444", ms: 1820, size: 8 },
] as const;

// ─── Easing ────────────────────────────────────────────────────────────────────
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }

export function LoadingScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [gone, setGone]       = useState(false);
  const rafRef                = useRef<number>(0);
  const startRef              = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const ms = now - startRef.current;
      setElapsed(ms);
      if (ms < TV_END + 50) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setGone(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (gone) return null;

  // ── derived values ──
  const fadeBlack  = clamp01((elapsed - FADE_START) / (FADE_END - FADE_START));

  const logoIn     = clamp01((elapsed - LOGO_IN)   / (LOGO_PEAK - LOGO_IN));
  const logoOut    = clamp01((elapsed - LOGO_OUT)   / (LOGO_GONE - LOGO_OUT));
  const logoOpacity = easeOut(logoIn) * (1 - easeOut(logoOut));

  // TV: scaleY from 1 → 0 (collapse to horizontal line) + glow
  const tvPct      = clamp01((elapsed - TV_START) / (TV_END - TV_START));
  const tvScale    = 1 - easeOut(tvPct);
  const tvGlow     = Math.sin(tvPct * Math.PI); // peaks at mid-collapse

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        background:      "#000",
        overflow:        "hidden",
        transform:       elapsed >= TV_START ? `scaleY(${tvScale})` : undefined,
        transformOrigin: "center",
      }}
    >
      {/* ── Drag strip photo ── */}
      {elapsed < FADE_END + 50 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Image
            src="/loading.png"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 20%" }}
            priority
          />
          {/* Bottom darkening — sky stays bright, track goes dark */}
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }} />
        </div>
      )}

      {/* ── Christmas tree lights ── */}
      {elapsed < FADE_END && LIGHTS.map((l, i) => {
        const on = elapsed >= l.ms;
        // flash on ignition
        const flashAge  = elapsed - l.ms;
        const flashBoost = on && flashAge < 120
          ? 1 + (1 - flashAge / 120) * 1.5   // size multiplier burst
          : 1;

        return (
          <span
            key={i}
            style={{
              position:     "absolute",
              top:          `${l.top}%`,
              left:         `${l.left}%`,
              transform:    "translate(-50%, -50%)",
              width:        on ? l.size * flashBoost : l.size * 0.7,
              height:       on ? l.size * flashBoost : l.size * 0.7,
              borderRadius: "50%",
              background:   on ? l.color : "rgba(0,0,0,0.4)",
              boxShadow:    on
                ? `0 0 ${l.size * 2}px ${l.size * 0.8}px ${l.bloom}CC,
                   0 0 ${l.size * 5}px ${l.size * 2}px ${l.bloom}55`
                : "none",
              opacity:    on ? 1 : 0.35,
              transition: on ? "none" : "all 0.12s ease-out",
              zIndex:     2,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* ── Fade-to-black overlay ── */}
      {fadeBlack > 0 && (
        <div style={{
          position: "absolute",
          inset:    0,
          background: "#000",
          opacity:  fadeBlack,
          zIndex:   3,
        }} />
      )}

      {/* ── Fedullo logo (large, centered) ── */}
      {logoOpacity > 0.01 && (
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          zIndex:         4,
          opacity:        logoOpacity,
        }}>
          <Image
            src="/fedullo.png"
            alt="Fedullo"
            width={600}
            height={350}
            style={{ width: "clamp(260px, 55vw, 600px)", height: "auto" }}
            priority
          />
        </div>
      )}

      {/* ── TV scan-line glow (visible during collapse) ── */}
      {elapsed >= TV_START && tvGlow > 0.02 && (
        <div style={{
          position:  "absolute",
          top:       "50%",
          left:      0,
          right:     0,
          height:    3,
          background: "#fff",
          boxShadow: `0 0 60px 30px rgba(255,255,255,${(tvGlow * 0.95).toFixed(2)}),
                      0 0 120px 60px rgba(255,255,255,${(tvGlow * 0.4).toFixed(2)})`,
          transform: "translateY(-50%)",
          zIndex:    5,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}
