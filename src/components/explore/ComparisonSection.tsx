import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const rows = [
  {
    label: "AI Integration",
    v2: "Add-on module, manual setup",
    v3: "Native, context-aware, always-on",
  },
  {
    label: "Note Editor",
    v2: "Basic rich text",
    v3: "Block-based with inline AI co-writer",
  },
  {
    label: "Module Architecture",
    v2: "Siloed, independent apps",
    v3: "Connected ecosystem — shared data",
  },
  {
    label: "Dashboard",
    v2: "Fixed layout",
    v3: "Fully customizable drag-resize grid",
  },
  {
    label: "Crypto Tracker",
    v2: "Dashboard view only",
    v3: "Live portfolio with analytics",
  },
  {
    label: "Developer Tools",
    v2: "Not available",
    v3: "Full developer workspace",
  },
  {
    label: "Theming",
    v2: "Light / Dark only",
    v3: "Deep customization engine",
  },
  {
    label: "Public Website",
    v2: "Static pages",
    v3: "Cinematic, interactive, 3D",
  },
];

export function ComparisonSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-20 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.6), transparent 70%)" }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-indigo-400 text-xs sm:text-sm tracking-[0.2em] uppercase font-medium mb-3">
            What changed
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            From v2 to{" "}
            <span className="text-gradient-brand">v3</span>
            {" "}— Everything.
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl mx-auto">
            This isn't an update. It's a complete rethinking of what a personal operating system should be.
          </p>
        </motion.div>

        {/* Table header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="hidden sm:grid grid-cols-[1fr_1fr_1fr] gap-4 mb-4 px-4"
        >
          <span className="text-xs text-white/30 uppercase tracking-widest font-medium">Feature</span>
          <span className="text-xs text-white/30 uppercase tracking-widest font-medium text-center">OneApp 2</span>
          <span className="text-xs text-indigo-400/80 uppercase tracking-widest font-medium text-center">OneApp 3.0</span>
        </motion.div>

        {/* Rows */}
        <div className="space-y-2 sm:space-y-2">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-0 sm:gap-4 rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/20 transition-colors duration-300"
            >
              {/* Feature name */}
              <div className="flex items-center gap-3 px-4 py-3 sm:py-4 bg-white/[0.02]">
                <span className="text-sm font-medium text-white/70">{row.label}</span>
              </div>

              {/* v2 */}
              <div className="flex items-center gap-2 px-4 py-3 sm:py-4 bg-white/[0.01]">
                <X className="w-3.5 h-3.5 text-white/20 shrink-0" />
                <span className="text-xs sm:text-sm text-white/30 line-through decoration-white/15">
                  {row.v2}
                </span>
              </div>

              {/* v3 */}
              <div className="flex items-center gap-2 px-4 py-3 sm:py-4 bg-indigo-500/[0.05] border-l border-indigo-500/10">
                <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-xs sm:text-sm text-white/80 font-medium">{row.v3}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 + rows.length * 0.06 + 0.1, ease: "easeOut" }}
          className="text-center mt-10"
        >
          <p className="text-white/30 text-sm">
            Ready to upgrade?{" "}
            <a
              href="/auth/signup"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
            >
              Start free →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
