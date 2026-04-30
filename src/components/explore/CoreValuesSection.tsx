import { useState, useRef, createRef, useEffect } from "react";
import { Shield, Zap, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionAnimation, CORE_VALUES_PHASES } from "@/hooks/useSectionAnimation";
import { useElementPositions } from "@/hooks/useElementPositions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConstellationHub } from "./ConstellationHub";
import { DynamicNeonPaths } from "./DynamicNeonPaths";
import { ValueNode } from "./ValueNode";
import { MobileNeonPath } from "./MobileNeonPath";

const coreValues = [
  {
    id: "secured",
    icon: Shield,
    title: "Secured",
    subtitle: "Your data, your control",
    gradientFrom: "#00F0FF",
    gradientTo: "#0EA5E9",
  },
  {
    id: "convenient",
    icon: Zap,
    title: "Convenient",
    subtitle: "All-in-one platform",
    gradientFrom: "#A855F7",
    gradientTo: "#EC4899",
  },
  {
    id: "flexible",
    icon: Target,
    title: "Flexible",
    subtitle: "Adapt to your needs",
    gradientFrom: "#10B981",
    gradientTo: "#14B8A6",
  },
];

export function CoreValuesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(coreValues.map(() => createRef<HTMLDivElement>()));
  
  // Simplified animation hook - once-only, CSS-based
  const { 
    isTriggered, 
    phaseDelays,
    isAnimating,
  } = useSectionAnimation(sectionRef, {
    rootMargin: "-50% 0px -50% 0px", // Trigger only when section reaches exact center of viewport
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

  // Enable hover only after cards have fully appeared (phase delay + max stagger + transition duration)
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

  // Force hoveredNode to null while hover is disabled (prevents glow/path conflicts)
  const safeHoveredNode = hoverEnabled ? hoveredNode : null;

  // Custom setter that respects hoverEnabled
  const handleSetHoveredNode = (id: string | null) => {
    if (hoverEnabled) {
      setHoveredNode(id);
    }
  };

  // Phase states - simple boolean based on trigger
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section title - Phase 0 */}
        <div
          className={cn(
            "text-center mb-6 md:mb-10",
            "transition-all duration-500 ease-out",
            isTriggered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
          style={{
            transitionDelay: `${phaseDelays.header}ms`,
          }}
        >
          <ChevronDown 
            className={cn(
              "w-5 h-5 mx-auto mb-2 text-white/30",
              "transition-opacity duration-500 ease-out",
              headerVisible ? "opacity-100 animate-bounce" : "opacity-0"
            )}
            style={{
              transitionDelay: `${phaseDelays.header + 100}ms`,
            }}
          />
          <p className="text-white/40 text-sm uppercase tracking-[0.2em]">
            Let's begin our journey
          </p>
        </div>

        {/* Desktop layout with SVG paths */}
        {!isMobile && (
          <div 
            ref={containerRef}
            className="relative hidden md:block" 
            style={{ height: "380px" }}
          >
            {/* Central Hub - Phase 0 (with header) */}
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

            {/* Dynamic Neon Paths - Phases 1-6 */}
            <DynamicNeonPaths
              positions={positions}
              isTriggered={isTriggered}
              scrollProgress={0}
              phaseDelays={phaseDelays}
              hoveredNode={safeHoveredNode}
            />

            {/* Value Cards - Phase 4 */}
            <div 
              className="absolute w-full grid grid-cols-3 gap-4 z-20"
              style={{ top: "140px", left: "0", right: "0" }}
            >
              {coreValues.map((value, index) => (
                <div 
                  key={value.id} 
                  className="flex justify-center"
                >
                  <ValueNode
                    ref={cardRefs.current[index]}
                    {...value}
                    delay={phaseDelays.cards + (index * 100)} // Cards phase + stagger
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

        {/* Mobile layout - Vertical stack with SVG neon paths */}
        {isMobile && (
          <div className="flex flex-col items-center gap-2 md:hidden">
            {/* Central Hub */}
            <ConstellationHub ref={hubRef} isVisible={hubVisible} className="mb-0" />

            {/* Mobile connection lines with SVG neon paths */}
            {coreValues.map((value, index) => {
              const pathDelay = phaseDelays.hubToJunction + (index * 300);
              const cardDelay = pathDelay + 400;
              
              return (
                <div key={value.id} className="w-full max-w-xs flex flex-col items-center">
                  {/* SVG Neon Path - replaces static div */}
                  <MobileNeonPath
                    color={value.gradientFrom}
                    delay={pathDelay}
                    isTriggered={isTriggered}
                    height={28}
                  />
                  
                  <ValueNode
                    ref={cardRefs.current[index]}
                    {...value}
                    delay={cardDelay}
                    isVisible={cardsVisible}
                    isActive={safeHoveredNode === value.id}
                    isOtherHovered={safeHoveredNode !== null && safeHoveredNode !== value.id}
                    onHover={handleSetHoveredNode}
                    isTriggered={isTriggered}
                    isAnimating={isAnimating}
                    hoverEnabled={hoverEnabled}
                  />
                </div>
              );
            })}

            {/* Bottom merge path - connects all cards */}
            <MobileNeonPath
              color="#A855F7"
              delay={phaseDelays.merge}
              isTriggered={isTriggered}
              height={40}
            />
          </div>
        )}
      </div>
    </section>
  );
}
