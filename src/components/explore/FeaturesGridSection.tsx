import { useRef } from "react";
import { Layers, Bot, Shield, Cloud, Puzzle, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionVisibility, VISIBILITY_PRESETS } from "@/hooks/useSectionVisibility";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
}

const features: Feature[] = [
  {
    icon: Layers,
    title: "One Unified System",
    description: "All your tools in a single workspace. No more tab switching, no more context switching.",
    gradient: "from-purple-500 to-violet-600",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description: "Multi-model AI with memory, custom agents, and intelligent automation built right in.",
    gradient: "from-cyan-400 to-blue-500",
    glowColor: "rgba(0, 240, 255, 0.4)",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "End-to-end encryption for your data. You own it, you control it — always.",
    gradient: "from-emerald-400 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Access your workspace from any device, any time. Real-time sync across all your platforms.",
    gradient: "from-sky-400 to-blue-600",
    glowColor: "rgba(14, 165, 233, 0.4)",
  },
  {
    icon: Puzzle,
    title: "Modular Apps",
    description: "Install only what you need. Extend your workspace with purpose-built modules.",
    gradient: "from-amber-400 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    icon: Code2,
    title: "Developer First",
    description: "Open API, custom integrations, and a full developer workspace for power users.",
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
];

export function FeaturesGridSection() {
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div
          className={cn(
            "text-center mb-14 transition-all duration-700",
            hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-white/40 text-sm uppercase tracking-[0.2em] mb-3">
            Why OneApp
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Everything you need,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              nothing you don't
            </span>
          </h2>
          <p className="mt-4 text-white/50 text-sm md:text-base max-w-lg mx-auto">
            A carefully crafted workspace designed around how you actually work.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={cn(
                  "group relative rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm",
                  "cursor-default transition-all duration-300 ease-out active:scale-[0.98]",
                  // Mobile: horizontal layout (icon left, text right)
                  "flex items-center gap-4 p-4",
                  // Desktop: vertical layout
                  "sm:flex-col sm:items-start sm:p-6",
                  "hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-white/15",
                  hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{ transitionDelay: `${150 + index * 80}ms` }}
              >
                {/* Hover glow background — desktop only */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden sm:block"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${feature.glowColor}20, transparent 60%)`,
                    boxShadow: `inset 0 0 30px ${feature.glowColor}10`,
                  }}
                />

                {/* Top edge glow on hover — desktop only */}
                <div
                  className="absolute top-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full hidden sm:block"
                  style={{ background: `linear-gradient(90deg, transparent, ${feature.glowColor}, transparent)` }}
                />

                {/* Icon — smaller on mobile */}
                <div
                  className={cn(
                    "relative shrink-0 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br",
                    feature.gradient,
                    "shadow-lg group-hover:scale-110 transition-transform duration-300",
                    "w-10 h-10 sm:w-12 sm:h-12 sm:mb-4"
                  )}
                  style={{ boxShadow: `0 4px 20px ${feature.glowColor}50` }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold text-sm sm:text-base mb-0 sm:mb-2 group-hover:text-white/95 transition-colors leading-tight">
                  {feature.title}
                </h3>
                {/* Description hidden on mobile to keep cards compact */}
                <p className="hidden sm:block text-white/50 text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
