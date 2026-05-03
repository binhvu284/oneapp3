import { useState, useRef, createRef, useEffect } from "react";
import { ShieldCheck, Layers, Puzzle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionAnimation, CORE_VALUES_PHASES } from "@/hooks/useSectionAnimation";
import { useElementPositions } from "@/hooks/useElementPositions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConstellationHub } from "./ConstellationHub";
import { DynamicNeonPaths } from "./DynamicNeonPaths";
import { ValueNode } from "./ValueNode";

const coreValues = [
  {
    id: "secured",
    icon: ShieldCheck,
    title: "Private by Design",
    subtitle: "End-to-end encrypted. Your data never leaves your control — ever.",
    gradientFrom: "#00F0FF",
    gradientTo: "#0EA5E9",
  },
  {
    id: "convenient",
    icon: Layers,
    title: "One Surface",
    subtitle: "Every tool unified in a single workspace. Zero switching, pure flow.",
    gradientFrom: "#A855F7",
    gradientTo: "#EC4899",
  },
  {
    id: "flexible",
    icon: Puzzle,
    title: "Built to Extend",
    subtitle: "Modular architecture. Install what you need, grow without limits.",
    gradientFrom: "#10B981",
    gradientTo: "#14B8A6",
  },
];

export function CoreValuesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(coreValues.map(() => createRef<HTMLDivElement>()));

  const {
    isTriggered,
    phaseDelays,
    isAnimating,
  } = useSectionAnimation(sectionRef, {
    rootMargin: "-50% 0px -50% 0px",
    phases: CORE_VALUES_PHASES,
  });

  const positions = useElementPositions(
    containerRef,
    hubRef,
    cardRefs.current
  );

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isTriggered) {
      setHoverEnabled(false);
      return;
    }
    setHoverEnabled(false);
    const maxStagger = (coreValues.length - 1) * (isMobile ? 300 : 100);
    const unlockAfter = (phaseDelays.cards ?? 0) + maxStagger + 1000;
    const timer = window.setTimeout(() => setHoverEnabled(true), unlockAfter);
    return () => window.clearTimeout(timer);
  }, [isTriggered, phaseDelays.cards, isMobile]);

  const safeHoveredNode = hoverEnabled ? hoveredNode : null;

  const handleSetHoveredNode = (id: string | null) => {
    if (hoverEnabled) setHoveredNode(id);
  };

  const headerVisible = isTriggered;
  const hubVisible = isTriggered;
  const cardsVisible = isTriggered;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative mt-16 md:mt-24 pb-16 md:pb-24 px-6 overflow-hidden",
        "transition-opacity duration-700 ease-out",
        isTriggered ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-8 md:mb-10",
            "transition-all duration-500 ease-out",
            isTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{ transitionDelay: `${phaseDelays.header}ms` }}
        >
          <ChevronDown
            className={cn(
              "w-5 h-5 mx-auto mb-3 text-white/30",
              "transition-opacity duration-500 ease-out",
              headerVisible ? "opacity-100 animate-bounce" : "opacity-0"
            )}
            style={{ transitionDelay: `${phaseDelays.header + 100}ms` }}
          />
          <p className="text-indigo-400/60 text-xs uppercase tracking-[0.25em] font-medium">
            Foundation
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            The three pillars of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              v3.0
            </span>
          </h2>
        </div>

        {/* Desktop layout */}
        {!isMobile && (
          <div
            ref={containerRef}
            className="relative hidden md:block"
            style={{ height: "380px" }}
          >
            <div
              className={cn(
                "absolute z-10",
                "transition-all duration-500 ease-out",
                hubVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              )}
              style={{
                left: "50%",
                top: "0",
                transform: `translateX(-50%) ${hubVisible ? "scale(1)" : "scale(0.9)"}`,
                transitionDelay: `${phaseDelays.header}ms`,
              }}
            >
              <ConstellationHub ref={hubRef} isVisible={hubVisible} />
            </div>

            <DynamicNeonPaths
              positions={positions}
              isTriggered={isTriggered}
              scrollProgress={0}
              phaseDelays={phaseDelays}
              hoveredNode={safeHoveredNode}
            />

            <div
              className="absolute w-full grid grid-cols-3 gap-4 z-20"
              style={{ top: "140px", left: "0", right: "0" }}
            >
              {coreValues.map((value, index) => (
                <div key={value.id} className="flex justify-center">
                  <ValueNode
                    ref={cardRefs.current[index]}
                    {...value}
                    delay={phaseDelays.cards + index * 100}
                    isVisible={cardsVisible}
                    isActive={safeHoveredNode === value.id}
                    isOtherHovered={safeHoveredNode !== null && safeHoveredNode !== value.id}
                    onHover={handleSetHoveredNode}
                    isTriggered={isTriggered}
                    isAnimating={isAnimating}
                    hoverEnabled={hoverEnabled}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile layout — clean stacked cards */}
        {isMobile && (
          <div className="md:hidden space-y-3">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              const delay = (phaseDelays.cards ?? 0) + index * 120;
              return (
                <div
                  key={value.id}
                  className={cn(
                    "relative flex items-start gap-4 p-5 rounded-2xl overflow-hidden",
                    "border border-white/8 bg-white/[0.03] backdrop-blur-sm",
                    "transition-all duration-600 ease-out"
                  )}
                  style={{
                    opacity: isTriggered ? 1 : 0,
                    transform: isTriggered ? "translateY(0)" : "translateY(24px)",
                    transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${value.gradientFrom}, ${value.gradientTo})`,
                    }}
                  />

                  {/* Subtle corner glow */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${value.gradientFrom}, transparent 70%)`,
                    }}
                  />

                  {/* Icon box */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${value.gradientFrom}25, ${value.gradientTo}15)`,
                      border: `1px solid ${value.gradientFrom}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: value.gradientFrom }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-[15px] leading-tight mb-1">
                      {value.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {value.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Bottom connector — visual hint that sections are linked */}
            <div
              className={cn(
                "flex items-center gap-3 px-2 pt-1 transition-all duration-700",
                isTriggered ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: `${(phaseDelays.cards ?? 0) + 3 * 120 + 200}ms` }}
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-white/25 text-[10px] uppercase tracking-[0.2em]">v3.0</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
