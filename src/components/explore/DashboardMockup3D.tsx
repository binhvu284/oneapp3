import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lightweight CSS-only mock of the OneApp dashboard, rendered with 3D perspective
 * and subtle mouse-driven parallax. Real screenshots arrive once Phase 4 ships.
 */
export function DashboardMockup3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const handler = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      setTilt({ x: -dy * 6, y: dx * 6 });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [reduceMotion]);

  const baseTransform = "rotateX(15deg) rotateY(-5deg)";
  const interactive = reduceMotion
    ? baseTransform
    : `rotateX(${15 + tilt.x}deg) rotateY(${-5 + tilt.y}deg)`;

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto w-full max-w-3xl aspect-[16/10] mt-12 sm:mt-16 [perspective:1400px]"
    >
      <div
        className="absolute inset-0 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-white/[0.04] to-black/40 backdrop-blur-sm shadow-[0_30px_80px_-20px_rgba(6,182,212,0.35)] transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: interactive,
        }}
      >
        {/* faux toolbar */}
        <div className="flex items-center gap-2 px-4 h-8 border-b border-white/10">
          <span className="w-2 h-2 rounded-full bg-rose-500/70" />
          <span className="w-2 h-2 rounded-full bg-amber-400/70" />
          <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-[10px] tracking-[0.2em] uppercase text-white/40">
            oneapp / dashboard
          </span>
        </div>
        {/* faux grid widgets */}
        <div className="absolute inset-x-4 top-12 bottom-4 grid grid-cols-6 grid-rows-4 gap-3">
          <div className="col-span-2 row-span-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="h-2 m-3 rounded bg-cyan-300/60 w-1/3" />
            <div className="h-1 mx-3 rounded bg-cyan-300/30 w-2/3" />
            <div className="h-1 mx-3 mt-2 rounded bg-cyan-300/20 w-1/2" />
          </div>
          <div className="col-span-4 row-span-2 rounded-lg bg-white/[0.04] border border-white/10 relative overflow-hidden">
            <svg className="absolute inset-0" viewBox="0 0 200 60" preserveAspectRatio="none">
              <polyline
                points="0,40 25,32 50,38 75,18 100,24 125,12 150,18 175,8 200,16"
                fill="none"
                stroke="rgba(6,182,212,0.7)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="col-span-3 row-span-2 rounded-lg bg-white/[0.03] border border-white/10">
            <div className="h-1 m-3 rounded bg-white/30 w-1/4" />
            <div className="h-1 mx-3 mt-2 rounded bg-white/20 w-1/2" />
            <div className="h-1 mx-3 mt-2 rounded bg-white/15 w-2/3" />
            <div className="h-1 mx-3 mt-2 rounded bg-white/10 w-3/5" />
          </div>
          <div className="col-span-3 row-span-2 rounded-lg bg-white/[0.03] border border-white/10 flex items-end justify-around p-3 gap-1">
            {[0.3, 0.6, 0.4, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/40 to-cyan-300/20"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
