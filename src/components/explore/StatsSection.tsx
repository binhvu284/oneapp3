import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSectionVisibility, VISIBILITY_PRESETS } from "@/hooks/useSectionVisibility";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
  color: string;
}

const stats: StatItem[] = [
  { value: 6, suffix: "+", label: "Apps Integrated", color: "#A855F7" },
  { value: 15, suffix: "+", label: "Modules Available", color: "#00F0FF" },
  { value: 100, suffix: "%", label: "Data Encrypted", color: "#10B981" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1, color: "#F59E0B" },
];

function AnimatedCounter({
  value,
  suffix,
  decimals = 0,
  color,
  isVisible,
  delay,
}: {
  value: number;
  suffix: string;
  decimals?: number;
  color: string;
  isVisible: boolean;
  delay: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible || started) return;

    const timer = setTimeout(() => {
      setStarted(true);
      const duration = 1800;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(eased * value);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayed(value);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, started, value, delay]);

  return (
    <span style={{ color }}>
      {displayed.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { hasBeenVisible } = useSectionVisibility(sectionRef, {
    rootMargin: VISIBILITY_PRESETS.lowerThird,
    once: true,
    observerDelay: 100,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 px-6 overflow-hidden"
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top/bottom gradient fade */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div
          className={cn(
            "text-center mb-14 transition-all duration-700",
            hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-3">
            By the Numbers
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              performance & trust
            </span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative group flex flex-col items-center text-center",
                "transition-all duration-700",
                hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{ transitionDelay: `${200 + index * 120}ms` }}
            >
              {/* Card */}
              <div
                className="relative w-full px-3 py-6 sm:px-4 sm:py-8 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm group-hover:border-opacity-40 active:scale-[0.98] transition-all duration-300 overflow-hidden"
                style={{ boxShadow: `0 0 30px ${stat.color}08` }}
              >
                {/* Glow on hover / active */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 100%, ${stat.color}15, transparent 70%)` }}
                />

                {/* Value */}
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums mb-1.5 sm:mb-2 transition-all duration-300 group-hover:scale-110">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    color={stat.color}
                    isVisible={hasBeenVisible}
                    delay={300 + index * 120}
                  />
                </div>

                {/* Divider line */}
                <div
                  className="w-8 h-[2px] mx-auto mb-2 rounded-full opacity-60"
                  style={{ backgroundColor: stat.color }}
                />

                {/* Label */}
                <p className="text-white/50 text-xs sm:text-sm font-medium leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
