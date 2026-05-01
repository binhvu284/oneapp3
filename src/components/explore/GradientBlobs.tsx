import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function GradientBlobs() {
  const reduceMotion = useReducedMotion();
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const cyanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 80;
      const y = (e.clientY / window.innerHeight - 0.5) * 60;
      setTarget({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const tick = () => {
      offset.current.x += (target.x - offset.current.x) * 0.05;
      offset.current.y += (target.y - offset.current.y) * 0.05;
      const el = cyanRef.current;
      if (el) {
        el.style.setProperty("--cursor-x", `${offset.current.x}px`);
        el.style.setProperty("--cursor-y", `${offset.current.y}px`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cyan blob - top right - cursor reactive */}
      <div
        ref={cyanRef}
        className={`absolute rounded-full blur-[80px] sm:blur-[120px] opacity-20 ${reduceMotion ? "" : "animate-blob-1"}`}
        style={{
          background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)",
          width: "clamp(260px, 60vw, 600px)",
          height: "clamp(260px, 60vw, 600px)",
          top: "-10%",
          right: "-10%",
          transform: reduceMotion
            ? undefined
            : "translate(var(--cursor-x, 0), var(--cursor-y, 0))",
          willChange: "transform",
        }}
      />

      {/* Purple blob - bottom left */}
      <div
        className={`absolute rounded-full blur-[60px] sm:blur-[100px] opacity-15 ${reduceMotion ? "" : "animate-blob-2"}`}
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          width: "clamp(200px, 55vw, 500px)",
          height: "clamp(200px, 55vw, 500px)",
          bottom: "10%",
          left: "-5%",
        }}
      />

      {/* Small accent blob */}
      <div
        className={`absolute rounded-full blur-[50px] sm:blur-[80px] opacity-10 ${reduceMotion ? "" : "animate-blob-3"}`}
        style={{
          background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)",
          width: "clamp(140px, 35vw, 300px)",
          height: "clamp(140px, 35vw, 300px)",
          top: "40%",
          left: "30%",
        }}
      />

      <style>{`
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(var(--cursor-x, 0), var(--cursor-y, 0)) scale(1); }
          25%       { transform: translate(calc(var(--cursor-x, 0px) + 30px), calc(var(--cursor-y, 0px) - 20px)) scale(1.05); }
          50%       { transform: translate(calc(var(--cursor-x, 0px) - 20px), calc(var(--cursor-y, 0px) + 20px)) scale(0.95); }
          75%       { transform: translate(calc(var(--cursor-x, 0px) + 10px), calc(var(--cursor-y, 0px) + 10px)) scale(1.02); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-30px, 20px) scale(1.03); }
          66%      { transform: translate(20px, -10px) scale(0.97); }
        }
        @keyframes blob-float-3 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(40px, -30px); }
        }
        .animate-blob-1 { animation: blob-float-1 20s ease-in-out infinite; }
        .animate-blob-2 { animation: blob-float-2 25s ease-in-out infinite; }
        .animate-blob-3 { animation: blob-float-3 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
