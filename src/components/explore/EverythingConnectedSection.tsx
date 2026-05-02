import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Brain, NotebookPen, TrendingUp, Library, Code2, LayoutDashboard } from "lucide-react";
import oneappLogo from "@/assets/oneapp-logo.png";

const modules = [
  { id: "ai", label: "OneAI", icon: Brain, angle: 270, color: "rgba(139,92,246,0.8)", glow: "rgba(139,92,246,0.3)" },
  { id: "note", label: "OneNote", icon: NotebookPen, angle: 330, color: "rgba(99,102,241,0.8)", glow: "rgba(99,102,241,0.3)" },
  { id: "crypto", label: "OneCrypto", icon: TrendingUp, angle: 30, color: "rgba(16,185,129,0.8)", glow: "rgba(16,185,129,0.3)" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, angle: 90, color: "rgba(56,189,248,0.8)", glow: "rgba(56,189,248,0.3)" },
  { id: "library", label: "OneLibrary", icon: Library, angle: 150, color: "rgba(251,191,36,0.8)", glow: "rgba(251,191,36,0.3)" },
  { id: "dev", label: "DevSpace", icon: Code2, angle: 210, color: "rgba(244,63,94,0.8)", glow: "rgba(244,63,94,0.3)" },
] as const;

function toXY(angleDeg: number, radius: number, cx: number, cy: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

const CX = 200;
const CY = 200;
const RADIUS = 140;
const NODE_R = 28;

export function EverythingConnectedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => {
      setCycleIndex((i) => (i + 1) % modules.length);
    }, 1400);
    return () => clearInterval(t);
  }, [inView]);

  const activeMod = activeModule
    ? modules.find((m) => m.id === activeModule)
    : modules[cycleIndex];

  const descriptions: Record<string, string> = {
    ai: "Context-aware AI that reads your notes, tasks, and patterns — always one step ahead.",
    note: "A second brain for founders. Block-based, bi-directional, with an inline AI co-writer.",
    crypto: "Live portfolio tracker with real-time analytics and mood-to-market correlation.",
    dashboard: "Drag-resize widget canvas. Your data, your layout, your rules.",
    library: "Curated knowledge base with search, tags, and AI-assisted discovery.",
    dev: "Full developer workspace: connections, schemas, deployments, all in one view.",
  };

  return (
    <section ref={ref} className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Deep ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.06), transparent 80%)" }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-20"
        >
          <p className="text-indigo-400 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium mb-3">
            The ecosystem
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            One System.{" "}
            <span className="text-gradient-brand">Infinite Connections.</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            Every module talks to every other. Your notes inform your AI. Your AI shapes your dashboard.
            Everything is one.
          </p>
        </motion.div>

        {/* Orbit diagram + description */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* SVG Orbit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex-shrink-0 w-[280px] h-[280px] sm:w-[400px] sm:h-[400px]"
          >
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ overflow: "visible" }}
            >
              {/* Orbit ring */}
              <motion.circle
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke="rgba(99,102,241,0.12)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                strokeDasharray="4 8"
              />

              {/* Connection lines */}
              {modules.map((mod, i) => {
                const pos = toXY(mod.angle, RADIUS, CX, CY);
                const isActive = activeMod?.id === mod.id;
                return (
                  <motion.line
                    key={`line-${mod.id}`}
                    x1={CX}
                    y1={CY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke={isActive ? mod.color : "rgba(99,102,241,0.08)"}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                    style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
                  />
                );
              })}

              {/* Module nodes */}
              {modules.map((mod, i) => {
                const pos = toXY(mod.angle, RADIUS, CX, CY);
                const isActive = activeMod?.id === mod.id;
                const Icon = mod.icon;
                return (
                  <g
                    key={mod.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveModule(mod.id === activeModule ? null : mod.id)}
                  >
                    {/* Glow */}
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isActive ? NODE_R + 10 : NODE_R + 4}
                      fill={mod.glow}
                      opacity={isActive ? 0.5 : 0.1}
                      style={{ filter: "blur(8px)", transition: "all 0.4s" }}
                    />
                    {/* Node bg */}
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_R}
                      fill={isActive ? mod.color.replace("0.8", "0.2") : "rgba(10,10,20,0.8)"}
                      stroke={isActive ? mod.color : "rgba(99,102,241,0.2)"}
                      strokeWidth={isActive ? 1.5 : 1}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={inView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transition: "fill 0.4s, stroke 0.4s" }}
                    />
                    {/* Label below */}
                    <motion.text
                      x={pos.x}
                      y={pos.y + NODE_R + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)"}
                      fontFamily="Inter, sans-serif"
                      fontWeight="500"
                      style={{ transition: "fill 0.4s" }}
                    >
                      {mod.label}
                    </motion.text>
                    {/* Foreign object for Lucide icon */}
                    <foreignObject
                      x={pos.x - 10}
                      y={pos.y - 10}
                      width={20}
                      height={20}
                      style={{ pointerEvents: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          color: isActive ? "white" : "rgba(255,255,255,0.4)",
                          transition: "color 0.4s",
                        }}
                      >
                        <Icon size={14} />
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Center hub */}
              <motion.circle
                cx={CX}
                cy={CY}
                r={36}
                fill="rgba(99,102,241,0.08)"
                stroke="rgba(99,102,241,0.3)"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Center pulse ring */}
              {inView && (
                <motion.circle
                  cx={CX}
                  cy={CY}
                  r={36}
                  fill="none"
                  stroke="rgba(99,102,241,0.4)"
                  strokeWidth="1"
                  animate={{ r: [36, 52], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* Center logo */}
              <foreignObject x={CX - 18} y={CY - 18} width={36} height={36}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <img src={oneappLogo} alt="OneApp" style={{ width: 26, height: 26, objectFit: "contain" }} />
                </div>
              </foreignObject>
            </svg>
          </motion.div>

          {/* Module description */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-0"
          >
            <AnimatePresence mode="wait">
              {activeMod && (
                <motion.div
                  key={activeMod.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: activeMod.glow, border: `1px solid ${activeMod.color}` }}
                    >
                      <activeMod.icon size={20} style={{ color: activeMod.color }} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{activeMod.label}</h3>
                  </div>
                  <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-6">
                    {descriptions[activeMod.id]}
                  </p>
                  <div
                    className="h-px w-16"
                    style={{ background: `linear-gradient(90deg, ${activeMod.color}, transparent)` }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Module grid (desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-2 mt-8">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id === activeModule ? null : mod.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all duration-300 ${
                    activeMod?.id === mod.id
                      ? "bg-white/5 text-white/90"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <mod.icon size={12} />
                  {mod.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
