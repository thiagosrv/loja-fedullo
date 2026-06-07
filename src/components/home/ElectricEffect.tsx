"use client";

import { useEffect, useRef } from "react";

interface ArcData {
  points: [number, number][];
  alpha: number;
  maxAlpha: number;
  age: number;
  lifeIn: number;
  lifeHold: number;
  lifeOut: number;
}

// Midpoint displacement — generates a jagged electric arc between two points
function buildArc(
  x1: number, y1: number,
  x2: number, y2: number,
  rough: number,
  depth: number
): [number, number][] {
  if (depth === 0) return [[x1, y1], [x2, y2]];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * rough;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * rough * 0.35;
  return [
    ...buildArc(x1, y1, mx, my, rough * 0.55, depth - 1),
    ...buildArc(mx, my, x2, y2, rough * 0.55, depth - 1).slice(1),
  ];
}

export function ElectricEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    let sinceLastArc = 0;
    let nextArcDelay = 2200 + Math.random() * 2000;
    const arcs: ArcData[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawnArc = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Arcs originate from the left or right edge region, away from center content
      const fromLeft = Math.random() > 0.5;
      const x1 = fromLeft
        ? Math.random() * w * 0.28
        : w * 0.72 + Math.random() * w * 0.28;
      const y1 = h * 0.12 + Math.random() * h * 0.68;

      const angle = fromLeft
        ? (-0.3 + Math.random() * 0.6) * Math.PI
        : (0.5 + Math.random() * 0.5) * Math.PI;
      const length = 60 + Math.random() * 120;
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length * 0.5;

      const depth = length < 80 ? 3 : 4;

      arcs.push({
        points: buildArc(x1, y1, x2, y2, length * 0.45, depth),
        alpha: 0,
        maxAlpha: 0.055 + Math.random() * 0.045,
        age: 0,
        lifeIn: 35,
        lifeHold: 60 + Math.random() * 100,
        lifeOut: 130,
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      sinceLastArc += dt;

      if (sinceLastArc >= nextArcDelay) {
        spawnArc();
        if (Math.random() > 0.55) spawnArc();
        sinceLastArc = 0;
        nextArcDelay = 2000 + Math.random() * 2800;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.age += dt;

        const total = arc.lifeIn + arc.lifeHold + arc.lifeOut;
        if (arc.age >= total) { arcs.splice(i, 1); continue; }

        if (arc.age < arc.lifeIn) {
          arc.alpha = (arc.age / arc.lifeIn) * arc.maxAlpha;
        } else if (arc.age < arc.lifeIn + arc.lifeHold) {
          arc.alpha = arc.maxAlpha;
        } else {
          arc.alpha = arc.maxAlpha * (1 - (arc.age - arc.lifeIn - arc.lifeHold) / arc.lifeOut);
        }

        ctx.save();
        ctx.globalAlpha = arc.alpha;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        ctx.moveTo(arc.points[0][0], arc.points[0][1]);
        for (let j = 1; j < arc.points.length; j++) {
          ctx.lineTo(arc.points[j][0], arc.points[j][1]);
        }
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame((now) => { lastTime = now; tick(now); });

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
