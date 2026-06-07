"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = ref.current;
    if (!el) return;

    const from: gsap.TweenVars = {
      autoAlpha: 0,
      ...(direction === "up" && { y: 36 }),
      ...(direction === "left" && { x: -36 }),
      ...(direction === "right" && { x: 36 }),
    };

    const to: gsap.TweenVars = {
      autoAlpha: 1,
      y: 0,
      x: 0,
      duration: 0.75,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
    };

    gsap.fromTo(el, from, to);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [delay, direction]);

  return (
    <div ref={ref} className={className} style={{ visibility: "hidden" }}>
      {children}
    </div>
  );
}
