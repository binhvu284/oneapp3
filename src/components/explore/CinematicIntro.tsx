import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import oneappLogo from "@/assets/oneapp-logo.png";

interface CinematicIntroProps {
  onComplete: () => void;
}

const STORAGE_KEY = "oneapp-v3-intro-seen";

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const alreadySeen = typeof sessionStorage !== "undefined"
    ? sessionStorage.getItem(STORAGE_KEY) === "1"
    : false;

  const [phase, setPhase] = useState<"logo" | "version" | "tag" | "exit" | "done">(
    alreadySeen || prefersReduced ? "done" : "logo"
  );
  const [visible, setVisible] = useState(!alreadySeen && !prefersReduced);

  useEffect(() => {
    if (!visible) {
      onComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase("version"), 900));
    timers.push(setTimeout(() => setPhase("tag"), 1900));
    timers.push(setTimeout(() => setPhase("exit"), 3000));
    timers.push(setTimeout(() => {
      setVisible(false);
      setPhase("done");
      sessionStorage.setItem(STORAGE_KEY, "1");
      onComplete();
    }, 3700));

    return () => timers.forEach(clearTimeout);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && phase !== "done" && (
        <motion.div
          key="cinematic-intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#030712" }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Cyberpunk grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
            }}
          />
          {/* Radial fade */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #030712 100%)",
            }}
          />

          {/* Scanline sweep */}
          {phase === "exit" && (
            <motion.div
              className="absolute inset-x-0 h-[2px] pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(56,189,248,0.5), transparent)",
                top: 0,
              }}
              animate={{ top: ["0%", "110%"] }}
              transition={{ duration: 0.55, ease: "linear" }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 select-none">
            {/* Logo */}
            <AnimatePresence>
              {(phase === "logo" || phase === "version" || phase === "tag" || phase === "exit") && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-16 h-16 sm:w-20 sm:h-20"
                >
                  <img src={oneappLogo} alt="OneApp" className="w-full h-full object-contain" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Version number */}
            <AnimatePresence>
              {(phase === "version" || phase === "tag" || phase === "exit") && (
                <motion.div
                  key="version"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-end gap-1"
                >
                  <span
                    className="font-bold tracking-tighter leading-none"
                    style={{
                      fontSize: "clamp(4rem, 14vw, 9rem)",
                      background: "linear-gradient(135deg, #818cf8 0%, #60a5fa 50%, #38bdf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "none",
                      filter: "drop-shadow(0 0 30px rgba(99,102,241,0.45))",
                    }}
                  >
                    3.0
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {(phase === "tag" || phase === "exit") && (
                <motion.p
                  key="tag"
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={{ opacity: 1, letterSpacing: "0.25em" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-indigo-300/80"
                >
                  The Complete Ecosystem
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Corner accents */}
          {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos, i) => (
            <motion.div
              key={pos}
              className={`absolute ${pos} w-5 h-5 pointer-events-none`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              style={{
                borderTop: i < 2 ? "1px solid rgba(99,102,241,0.5)" : "none",
                borderBottom: i >= 2 ? "1px solid rgba(99,102,241,0.5)" : "none",
                borderLeft: i % 2 === 0 ? "1px solid rgba(99,102,241,0.5)" : "none",
                borderRight: i % 2 === 1 ? "1px solid rgba(99,102,241,0.5)" : "none",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
