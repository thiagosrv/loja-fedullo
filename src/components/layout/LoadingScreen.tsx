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
  { left: px(721, IMG_W), top: px(279, IMG_H), color: "#f97316", glow: "#f97316", ms:   0 },
  { left: px(806, IMG_W), top: px(279, IMG_H), color: "#f97316", glow: "#f97316", ms:   0 },
  // ── Laranja par 2 ──
  { left: px(720, IMG_W), top: px(325, IMG_H), color: "#f97316", glow: "#f97316", ms: 220 },
  { left: px(805, IMG_W), top: px(325, IMG_H), color: "#f97316", glow: "#f97316", ms: 220 },
  // ── Laranja par 3 ──
  { left: px(721, IMG_W), top: px(371, IMG_H), color: "#f97316", glow: "#f97316", ms: 440 },
  { left: px(805, IMG_W), top: px(371, IMG_H), color: "#f97316", glow: "#f97316", ms: 440 },
  // ── Verde ──
  { left: px(721, IMG_W), top: px(416, IMG_H), color: "#22c55e", glow: "#22c55e", ms: 680 },
  { left: px(804, IMG_W), top: px(414, IMG_H), color: "#22c55e", glow: "#22c55e", ms: 680 },
  // ── Vermelho ──
  { left: px(720, IMG_W), top: px(462, IMG_H), color: "#ef4444", glow: "#ef4444", ms: 920 },
  { left: px(804, IMG_W), top: px(463, IMG_H), color: "#ef4444", glow: "#ef4444", ms: 920 },
] as const;

// ─── Timings (ms) ─────────────────────────────────────────────────────────────
const FADE_START   = 1050;   // fade para preto começa
const FADE_END     = 1380;   // totalmente preto
const LOGO_IN      = 1400;   // logo aparece
const LOGO_PEAK    = 1650;   // logo totalmente visível
const LOGO_OUT     = 1850;   // logo começa a sumir
const LOGO_GONE    = 2050;   // logo invisível → smoke imediato
const SMOKE_START  = 2050;   // efeito smoke começa
const SMOKE_END    = 2650;   // smoke termina → site abre

function easeOut(t: number)  { return 1 - Math.pow(1 - t, 3); }
function easeOut2(t: number) { return 1 - Math.pow(1 - t, 2); } // mais suave
function clamp(t: number)    { return Math.max(0, Math.min(1, t)); }

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
      if (ms < SMOKE_END + 60) rafRef.current = requestAnimationFrame(tick);
      else setGone(true);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (gone) return null;

  // ── Overlay preto (fade imagem → preto) ──
  const fadeBlack = clamp((elapsed - FADE_START) / (FADE_END - FADE_START));

  // ── Logo ──
  const logoIn    = easeOut(clamp((elapsed - LOGO_IN)  / (LOGO_PEAK - LOGO_IN)));
  const logoOut   = easeOut(clamp((elapsed - LOGO_OUT) / (LOGO_GONE - LOGO_OUT)));
  const logoAlpha = logoIn * (1 - logoOut);

  // ── Smoke premium ──────────────────────────────────────────────────────────
  const smokeActive = elapsed >= SMOKE_START;
  const smokePct    = clamp((elapsed - SMOKE_START) / (SMOKE_END - SMOKE_START));

  // Curvas independentes para cada camada de smoke
  const smokeMain = easeOut(smokePct);                              // dissolução principal
  const wisp1     = easeOut2(clamp(smokePct * 1.25));              // wisp esq — rápido
  const wisp2     = easeOut2(clamp((smokePct - 0.18) / 0.82));    // wisp dir — atrasado
  const wisp3     = easeOut(clamp((smokePct - 0.06) / 0.74));     // bloom central

  // Flash de exalação inicial (0→18% opacidade nos primeiros 8%, depois some)
  const flashRaw   = smokePct < 0.08
    ? smokePct / 0.08
    : Math.max(0, 1 - (smokePct - 0.08) / 0.20);
  const flashAlpha = flashRaw * 0.16;

  // Opacidade, blur e scale do wrapper interno durante smoke
  const innerOpacity   = smokeActive ? Math.max(0, 1 - smokeMain) : 1;
  const innerBlur      = smokeActive ? smokeMain * 20            : 0;
  const innerScale     = smokeActive ? 1 + smokeMain * 0.055     : 1;

  // Opacidade dos wisps: sobe e desce (curva sino) — max nos 40%
  const wispBell = (p: number) => Math.max(0, Math.sin(p * Math.PI));

  return (
    <div
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     9999,
        background: "#000",
        overflow:   "hidden",
      }}
    >
      {/* ── Wrapper interno — recebe o smoke transform ── */}
      <div
        style={{
          position:        "absolute",
          inset:           0,
          opacity:         innerOpacity,
          filter:          innerBlur > 0.2 ? `blur(${innerBlur.toFixed(1)}px)` : undefined,
          transform:       smokeActive ? `scale(${innerScale.toFixed(4)})` : undefined,
          transformOrigin: "center center",
          willChange:      smokeActive ? "opacity, transform, filter" : undefined,
        }}
      >
        {/* ══════════════════════════════════════════════
            Container cobre o viewport inteiro em qualquer
            orientação mantendo a proporção 3:2 da imagem.
        ══════════════════════════════════════════════ */}
        {elapsed < FADE_END + 50 && (
          <div
            style={{
              position:  "absolute",
              top:       "50%",
              left:      "50%",
              transform: "translate(-50%, -50%)",
              width:     "max(100vw, 150svh)",
              height:    "max(100svh, 66.667vw)",
            }}
          >
            {/* Foto do semáforo */}
            <Image
              src="/loading.webp"
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "fill" }}
              priority
            />

            {/* ── Luzes do semáforo ── */}
            {LIGHTS.map((l, i) => {
              const on   = elapsed >= l.ms;
              const age  = elapsed - l.ms;
              const burst = on && age < 150 ? 1 + (1 - age / 150) * 0.8 : 1;
              const BASE = 1.6;
              const size = on ? BASE * burst : BASE * 0.6;

              return (
                <span
                  key={i}
                  style={{
                    position:      "absolute",
                    top:           `${l.top}%`,
                    left:          `${l.left}%`,
                    transform:     "translate(-50%, -50%)",
                    display:       "block",
                    width:         `${size}vw`,
                    height:        `${size}vw`,
                    borderRadius:  "50%",
                    background:    on ? l.color : "rgba(0,0,0,0.3)",
                    boxShadow:     on
                      ? `
                          0 0 ${size * 0.5}vw  ${size * 0.3}vw ${l.glow}E6,
                          0 0 ${size * 1.5}vw  ${size * 0.8}vw ${l.glow}B8,
                          0 0 ${size * 3.5}vw  ${size * 1.8}vw ${l.glow}6B,
                          0 0 ${size * 7}vw    ${size * 4}vw   ${l.glow}2E
                        `
                      : "none",
                    opacity:       on ? 1 : 0.4,
                    transition:    on ? "none" : "opacity 0.1s",
                    zIndex:        2,
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

        {/* ── Logo Fedullo ── */}
        {logoAlpha > 0.01 && (
          <div
            style={{
              position:       "absolute",
              inset:          0,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              zIndex:         4,
              opacity:        logoAlpha,
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

        {/* ── Smoke: wisps + flash — dentro do wrapper (são afetados pelo blur) ── */}
        {smokeActive && smokePct < 1 && (
          <>
            {/* Flash de exalação — puff rápido no início */}
            {flashAlpha > 0.004 && (
              <div
                style={{
                  position:   "absolute",
                  inset:      0,
                  background: "radial-gradient(ellipse 70% 50% at 50% 55%, rgba(255,255,255,1) 0%, rgba(220,220,240,0.4) 45%, transparent 80%)",
                  opacity:    flashAlpha,
                  zIndex:     8,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Wisp 1 — sobe para a esquerda */}
            {wisp1 > 0.01 && (
              <div
                style={{
                  position:  "absolute",
                  top:       `${52 - wisp1 * 24}%`,
                  left:      `${41 - wisp1 * 7}%`,
                  width:     `${28 + wisp1 * 22}%`,
                  height:    `${18 + wisp1 * 20}%`,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.14) 0%, rgba(200,210,255,0.05) 50%, transparent 75%)",
                  opacity:   wispBell(wisp1) * 0.9,
                  pointerEvents: "none",
                  zIndex:    7,
                }}
              />
            )}

            {/* Wisp 2 — sobe para a direita (atrasado) */}
            {wisp2 > 0.01 && (
              <div
                style={{
                  position:  "absolute",
                  top:       `${56 - wisp2 * 20}%`,
                  left:      `${60 + wisp2 * 6}%`,
                  width:     `${22 + wisp2 * 18}%`,
                  height:    `${16 + wisp2 * 17}%`,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse at 60% 55%, rgba(255,255,255,0.10) 0%, rgba(210,200,255,0.04) 55%, transparent 80%)",
                  opacity:   wispBell(wisp2) * 0.75,
                  pointerEvents: "none",
                  zIndex:    7,
                }}
              />
            )}

            {/* Wisp 3 — bloom central que se expande */}
            {wisp3 > 0.01 && (
              <div
                style={{
                  position:  "absolute",
                  top:       `${50 - wisp3 * 16}%`,
                  left:      "50%",
                  width:     `${36 + wisp3 * 34}%`,
                  height:    `${24 + wisp3 * 28}%`,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.09) 0%, rgba(180,190,255,0.03) 55%, transparent 80%)",
                  opacity:   wispBell(wisp3) * 0.85,
                  pointerEvents: "none",
                  zIndex:    7,
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
