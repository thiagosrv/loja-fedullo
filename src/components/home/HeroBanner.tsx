"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ElectricEffect } from "./ElectricEffect";

export function HeroBanner() {
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.25, defaults: { ease: "power3.out" } });

    gsap.set(
      [logoRef.current, taglineRef.current, headlineRef.current, subRef.current, ctaRef.current, lineRef.current],
      { autoAlpha: 0 }
    );
    gsap.set(logoRef.current, { scale: 0.92 });
    gsap.set([headlineRef.current, subRef.current], { y: 28 });
    gsap.set(ctaRef.current, { y: 16 });
    gsap.set(lineRef.current, { scaleX: 0, transformOrigin: "center" });

    tl
      .to(logoRef.current, { autoAlpha: 1, scale: 1, duration: 1.1 })
      .to(lineRef.current, { autoAlpha: 1, scaleX: 1, duration: 0.6, ease: "power2.out" }, "-=0.5")
      .to(taglineRef.current, { autoAlpha: 1, duration: 0.5 }, "-=0.3")
      .to(headlineRef.current, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.3")
      .to(subRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.45")
      .to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.4");
  }, []);

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col items-center justify-center bg-[#000] overflow-hidden select-none">

      {/* ── Layer 0: Background depth gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 110% 75% at 25% 40%, #0d0d0d 0%, #050505 45%, #000000 75%)",
          zIndex: 0,
        }}
      />

      {/* ── Layer 1: Grid texture — ABOVE the blob ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          opacity: 0.028,
          zIndex: 1,
        }}
      />

      {/* ── Layer 2: Electric arcs ── */}
      <ElectricEffect />

      {/* ── Layer 3: Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)",
          zIndex: 3,
        }}
      />

      {/* ── Layer 4: Content ── */}
      <div
        className="relative flex flex-col items-center text-center px-6 max-w-4xl mx-auto gap-0"
        style={{ zIndex: 4 }}
      >
        {/* Wordmark logo */}
        <div ref={logoRef} className="w-full max-w-[480px] sm:max-w-[600px] mb-4">
          <Image
            src="/fedullo.png"
            alt="Fedullo"
            width={600}
            height={350}
            priority
            className="w-full h-auto"
          />
        </div>

        {/* Hairline divider */}
        <div ref={lineRef} className="w-24 h-px bg-white/20 mb-5" />

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-[11px] font-bold tracking-[0.35em] uppercase text-white/55 mb-6"
        >
          Motorsport Wiring
        </p>

        {/* Hero headline */}
        <h1
          ref={headlineRef}
          className="text-[clamp(2rem,5vw,3.5rem)] font-bold text-white leading-[1.1] tracking-tight mb-5"
        >
          Engenharia elétrica
          <br />
          <span className="text-white/50 font-light">de corrida</span>
        </h1>

        {/* Sub copy */}
        <p
          ref={subRef}
          className="text-[15px] text-white/40 leading-relaxed max-w-md mb-10 font-light"
        >
          Chicotes, caixas de relé e instrumentação para quem prepara carros de verdade.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="flex items-center justify-center">
          <Link
            href="/chicotes"
            className="inline-flex items-center justify-center h-12 sm:h-11 px-10 rounded-[8px] bg-[#dc2626] text-white text-sm font-semibold tracking-wide hover:bg-[#b91c1c] active:bg-[#b91c1c] transition-colors duration-200"
          >
            Explorar Produtos
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator — seta pulsante ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 4 }}
      >
        <span className="text-[8px] tracking-[0.35em] text-white/30 uppercase font-medium">Scroll</span>
        <svg
          width="16"
          height="24"
          viewBox="0 0 16 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-scroll-arrow"
          aria-hidden="true"
        >
          <path
            d="M8 2 L8 18"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M2 13 L8 20 L14 13"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

    </section>
  );
}
