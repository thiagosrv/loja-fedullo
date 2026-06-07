"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// ─── Dimensões reais da imagem ─────────────────────────────────────────────────
const IMG_W = 1536;
const IMG_H = 1024;

// Converte pixel da imagem → % do container
const px = (x: number, dim: number) => +(x / dim * 100).toFixed(4);

// ─── Posições exatas das luzes (coordenadas em pixels na imagem original) ──────
const LIGHTS = [
  // ── Laranja par 1 ──
  { left: px(721, IMG_W), top: px(279, IMG_H), color: "#f97316", glow: "#f97316", ms:    0 },
  { left: px(806, IMG_W), top: px(279, IMG_H), color: "#f97316", glow: "#f97316", ms:    0 },
  // ── Laranja par 2 ──
  { left: px(720, IMG_W), top: px(325, IMG_H), color: "#f97316", glow: "#f97316", ms:  380 },
  { left: px(805, IMG_W), top: px(325, IMG_H), color: "#f97316", glow: "#f97316", ms:  380 },
  // ── Laranja par 3 ──
  { left: px(721, IMG_W), top: px(371, IMG_H), color: "#f97316", glow: "#f97316", ms:  760 },
  { left: px(805, IMG_W), top: px(371, IMG_H), color: "#f97316", glow: "#f97316", ms:  760 },
  // ── Verde ──
  { left: px(721, IMG_W), top: px(416, IMG_H), color: "#22c55e", glow: "#22c55e", ms: 1180 },
  { left: px(804, IMG_W), top: px(414, IMG_H), color: "#22c55e", glow: "#22c55e", ms: 1180 },
  // ── Vermelho ──
  { left: px(720, IMG_W), top: px(462, IMG_H), color: "#ef4444", glow: "#ef4444", ms: 1560 },
  { left: px(804, IMG_W), top: px(463, IMG_H), color: "#ef4444", glow: "#ef4444", ms: 1560 },
] as const;

// ─── Timings (ms) ─────────────────────────────────────────────────────────────
const FADE_START  = 1800;  // fade para preto começa
const FADE_END    = 2250;  // totalmente preto
const LOGO_IN     = 2300;  // logo aparece
const LOGO_PEAK   = 2650;  // logo totalmente visível
const LOGO_OUT    = 3200;  // logo começa a sumir
const LOGO_GONE   = 3550;  // logo invisível
const TV_START    = 3550;  // efeito TV começa
const TV_END      = 4050;  // efeito TV termina → site abre

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function clamp(t: number)   { return Math.max(0, Math.min(1, t)); }

export function LoadingScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [gone,    setGone]    = useState(false);
  const rafRef  = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const ms = now - startRef.current;
      setElapsed(ms);
      if (ms < TV_END + 60) rafRef.current = requestAnimationFrame(tick);
      else setGone(true);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (gone) return null;

  // ── Overlay preto (fade) ──
  const fadeBlack = clamp((elapsed - FADE_START) / (FADE_END - FADE_START));

  // ── Logo ──
  const logoIn  = easeOut(clamp((elapsed - LOGO_IN)  / (LOGO_PEAK - LOGO_IN)));
  const logoOut = easeOut(clamp((elapsed - LOGO_OUT) / (LOGO_GONE - LOGO_OUT)));
  const logoAlpha = logoIn * (1 - logoOut);

  // ── Efeito TV ──
  const tvPct   = clamp((elapsed - TV_START) / (TV_END - TV_START));
  const tvScale = 1 - easeOut(tvPct);
  const tvGlow  = Math.sin(tvPct * Math.PI);

  return (
    <div
      style={{
        position:        "fixed",
        inset:           0,
        zIndex:          9999,
        background:      "#000",
        overflow:        "hidden",
        transform:       elapsed >= TV_START ? `scaleY(${Math.max(tvScale, 0)})` : undefined,
        transformOrigin: "center",
      }}
    >
      {/* ══════════════════════════════════════════════
          Container com aspect-ratio EXATO da imagem
          (1536 × 1024 → 3:2).
          Posicionado no topo-esquerdo, largura = 100vw.
          Na maioria dos desktops (16:9) a base extrapola
          o viewport — o overflow: hidden acima corta.
          As luzes são filhas deste container, por isso
          o % bate exatamente nos pixels originais.
      ══════════════════════════════════════════════ */}
      {elapsed < FADE_END + 50 && (
        <div
          style={{
            position:    "absolute",
            top:         0,
            left:        0,
            width:       "100vw",
            aspectRatio: `${IMG_W} / ${IMG_H}`,   // CSS nativo
          }}
        >
          {/* Foto do semáforo */}
          <Image
            src="/loading.png"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "fill" }}   // sem crop — container = ratio exato
            priority
          />

          {/* ── Luzes do semáforo ── */}
          {LIGHTS.map((l, i) => {
            const on = elapsed >= l.ms;
            // burst flash ao acender: size × 1.8 nos primeiros 150ms
            const age   = elapsed - l.ms;
            const burst = on && age < 150 ? 1 + (1 - age / 150) * 0.8 : 1;

            // tamanho base em vw (proporcional ao container)
            const BASE = 1.6;   // vw — ~24px no bulbo real
            const size = on ? BASE * burst : BASE * 0.6;

            return (
              <span
                key={i}
                style={{
                  position:     "absolute",
                  top:          `${l.top}%`,
                  left:         `${l.left}%`,
                  transform:    "translate(-50%, -50%)",
                  display:      "block",
                  width:        `${size}vw`,
                  height:       `${size}vw`,
                  borderRadius: "50%",
                  background:   on ? l.color : "rgba(0,0,0,0.3)",
                  boxShadow:    on
                    ? `
                        0 0 ${size * 0.5}vw  ${size * 0.3}vw ${l.glow}FF,
                        0 0 ${size * 1.5}vw  ${size * 0.8}vw ${l.glow}CC,
                        0 0 ${size * 3.5}vw  ${size * 1.8}vw ${l.glow}77,
                        0 0 ${size * 7}vw    ${size * 4}vw   ${l.glow}33
                      `
                    : "none",
                  opacity:      on ? 1 : 0.4,
                  transition:   on ? "none" : "opacity 0.1s",
                  zIndex:       2,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      )}

      {/* ── Overlay fade para preto ── */}
      {fadeBlack > 0 && (
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: "#000",
            opacity:    fadeBlack,
            zIndex:     3,
          }}
        />
      )}

      {/* ── Logo Fedullo (grande, centralizado) ── */}
      {logoAlpha > 0.01 && (
        <div
          style={{
            position:        "absolute",
            inset:           0,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            zIndex:          4,
            opacity:         logoAlpha,
          }}
        >
          <Image
            src="/fedullo.png"
            alt="Fedullo"
            width={600}
            height={350}
            style={{ width: "clamp(280px, 58vw, 640px)", height: "auto" }}
            priority
          />
        </div>
      )}

      {/* ── Linha de brilho efeito TV ── */}
      {elapsed >= TV_START && tvGlow > 0.02 && (
        <div
          style={{
            position:   "absolute",
            top:        "50%",
            left:       0,
            right:      0,
            height:     3,
            background: "#fff",
            boxShadow:  `
              0 0 60px  30px rgba(255,255,255,${(tvGlow * 0.95).toFixed(2)}),
              0 0 120px 60px rgba(255,255,255,${(tvGlow * 0.45).toFixed(2)})
            `,
            transform:  "translateY(-50%)",
            zIndex:     5,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
