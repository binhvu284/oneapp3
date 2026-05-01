import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { EcosystemModule } from "@/data/ecosystemModules";

interface ModuleCardProps {
  module: EcosystemModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = module.icon;
  const reduceMotion = useReducedMotion();
  const isLive = module.status === "live";

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-7 overflow-hidden"
      style={{
        // CSS var lets us reference the module accent across pseudos
        ["--module-accent" as string]: module.accent,
      }}
    >
      {/* hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          reduceMotion && "hidden"
        )}
        style={{
          background: `radial-gradient(circle at 30% 0%, ${module.accent}26, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center border"
          style={{
            backgroundColor: `${module.accent}1A`,
            borderColor: `${module.accent}55`,
            color: module.accent,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={cn(
            "text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border",
            isLive
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-white/15 bg-white/5 text-gray-400"
          )}
        >
          {isLive ? "Live" : "Coming Soon"}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-1">{module.name}</h3>
      <p
        className="text-sm font-medium mb-3"
        style={{ color: module.accent }}
      >
        {module.tagline}
      </p>
      <p className="text-sm text-gray-400 leading-relaxed mb-5">{module.description}</p>

      <ul className="space-y-2 text-xs text-gray-300">
        {module.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: module.accent }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* faux preview ribbon — hover-only, decorative */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-6 bottom-0 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          reduceMotion && "hidden"
        )}
        style={{
          background: `linear-gradient(90deg, transparent, ${module.accent}, transparent)`,
        }}
      />
    </motion.div>
  );
}
