import { useRef, useEffect, useState } from "react";
import { animate, stagger, createTimeline } from "animejs";
import oneappLogo from "@/assets/oneapp-logo.png";
import {
  StickyNote,
  Bitcoin,
  Bot,
  Library,
  ShoppingBag,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionVisibility, VISIBILITY_PRESETS } from "@/hooks/useSectionVisibility";
import { OrbitNode, OrbitNodeData } from "./OrbitNode";
import { useIsMobile } from "@/hooks/use-mobile";

const orbitNodes: OrbitNodeData[] = [
  {
    id: "onenote",
    icon: StickyNote,
    title: "OneNote",
    description: "Smart note management",
    color: "#A855F7",
    status: "live",
  },
  {
    id: "onecrypto",
    icon: Bitcoin,
    title: "OneCrypto",
    description: "Crypto portfolio tracker",
    color: "#F59E0B",
    status: "live",
  },
  {
    id: "oneai",
    icon: Bot,
    title: "OneAI",
    description: "Multi-model AI assistant",
    color: "#00F0FF",
    status: "live",
  },
  {
    id: "onelibrary",
    icon: Library,
    title: "OneLibrary",
    description: "Document storage",
    color: "#10B981",
    status: "live",
  },
  {
    id: "onecommerce",
    icon: ShoppingBag,
    title: "OneCommerce",
    description: "E-commerce management",
    color: "#EC4899",
    status: "coming-soon",
  },
  {
    id: "onenews",
    icon: Newspaper,
    title: "OneNews",
    description: "Curated news feed",
    color: "#0EA5E9",
    status: "coming-soon",
  },
];

export function EcosystemOrbitSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const orbitRingsRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const isMobile = useIsMobile();

  const { hasBeenVisible } = useSectionVisibility(sectionRef, {
    rootMargin: VISIBILITY_PRESETS.center,
    once: true,
    observerDelay: 150,
  });

  // Main entrance animation
  useEffect(() => {
    if (!hasBeenVisible || hasAnimated) return;
    if (!hubRef.current || !orbitRingsRef.current) return;

    setHasAnimated(true);

    const timeline = createTimeline({ defaults: { ease: "outExpo" } });

    // Phase 1: Hub entrance with elastic bounce
    timeline.add(hubRef.current, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 800,
      ease: "outElastic(1, 0.6)",
    });

    // Phase 2: Orbit rings draw in (desktop only)
    if (!isMobile) {
      const rings = orbitRingsRef.current.querySelectorAll(".orbit-ring");
      rings.forEach((ring) => {
        const length =
          (ring as SVGCircleElement).getTotalLength?.() ||
          2 * Math.PI * parseFloat(ring.getAttribute("r") || "0");
        (ring as SVGElement).style.strokeDasharray = `${length}`;
        (ring as SVGElement).style.strokeDashoffset = `${length}`;
      });

      timeline.add(
        ".orbit-ring",
        {
          strokeDashoffset: 0,
          duration: 1500,
          delay: stagger(200),
          ease: "inOutQuart",
        },
        "-=400"
      );
    }

    // Phase 3: Nodes fly in with stagger
    timeline.add(
      nodeRefs.current.filter(Boolean),
      {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 600,
        delay: stagger(100, { from: "center" }),
        ease: "outBack",
      },
      isMobile ? "-=400" : "-=800"
    );

    // Phase 4: Start continuous orbit rotation via CSS (guaranteed sync)
    if (!isMobile) {
      timeline.add(
        {},
        {
          duration: 100,
          onComplete: () => {
            // Apply CSS animations directly — browser keeps them perfectly in sync
            const orbitGroupEl = sectionRef.current?.querySelector(".orbit-group") as HTMLElement | null;
            const counterEls = sectionRef.current?.querySelectorAll(".counter-rotate");

            if (orbitGroupEl) {
              orbitGroupEl.style.animation = "ecosystem-orbit-spin 60s linear infinite";
            }
            counterEls?.forEach((el) => {
              (el as HTMLElement).style.animation = "ecosystem-orbit-counter 60s linear infinite";
            });
          },
        }
      );
    }
  }, [hasBeenVisible, hasAnimated, isMobile]);

  const getNodePosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  const activeNodeData = orbitNodes.find((n) => n.id === activeNode);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative py-20 md:py-32 px-6 overflow-hidden",
        "transition-opacity duration-700 ease-out",
        hasBeenVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-12 md:mb-20",
            "transition-all duration-700 ease-out",
            hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "100ms" }}
        >
          <p className="text-indigo-400/70 text-xs uppercase tracking-[0.25em] font-medium mb-3">
            v3.0 Ecosystem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Six modules.{" "}
            <span className="text-gradient-brand">
              One intelligence.
            </span>
          </h2>
          <p className="mt-4 text-white/50 text-sm md:text-base max-w-md mx-auto">
            Every module shares context. Your notes feed your AI. Your AI shapes your dashboard. In v3, everything thinks together.
          </p>
        </div>

        {/* Desktop: Orbital layout */}
        {!isMobile && (
          <div
            className="relative hidden md:flex items-center justify-center"
            style={{ height: "420px" }}
          >
            {/* SVG Orbit Rings */}
            <svg
              ref={orbitRingsRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="-200 -200 400 400"
              style={{ overflow: "visible" }}
            >
              <defs>
                <filter id="orbit-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer ring */}
              <circle
                className="orbit-ring"
                cx="0" cy="0" r="160"
                fill="none"
                stroke="rgba(99, 102, 241, 0.2)"
                strokeWidth="1"
                filter="url(#orbit-glow)"
              />
              {/* Middle ring */}
              <circle
                className="orbit-ring"
                cx="0" cy="0" r="120"
                fill="none"
                stroke="rgba(96, 165, 250, 0.15)"
                strokeWidth="1"
                filter="url(#orbit-glow)"
              />
              {/* Inner ring */}
              <circle
                className="orbit-ring"
                cx="0" cy="0" r="80"
                fill="none"
                stroke="rgba(99, 102, 241, 0.1)"
                strokeWidth="1"
                filter="url(#orbit-glow)"
              />
            </svg>

            {/* Central Hub */}
            <div
              ref={hubRef}
              className={cn(
                "absolute z-30 w-20 h-20 rounded-full",
                "bg-gradient-to-br from-purple-500/20 to-cyan-500/20",
                "border border-white/20 backdrop-blur-sm",
                "flex items-center justify-center"
              )}
              style={{ opacity: 0, transform: "scale(0)" }}
            >
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/40 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-[-6px] rounded-full border border-purple-500/20 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
              <div
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.5)]"
              >
                <img src={oneappLogo} alt="OneApp" className="w-9 h-9 object-contain" />
              </div>
            </div>

            {/* Orbit nodes group — rotates continuously */}
            <div className="orbit-group absolute inset-0 flex items-center justify-center">
              {/* Connection lines inside orbit space — always point from center to each node */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="-200 -200 400 400"
                style={{ overflow: "visible" }}
              >
                {orbitNodes.map((node, index) => {
                  const pos = getNodePosition(index, orbitNodes.length, 140);
                  const isActive = activeNode === node.id;
                  return (
                    <g key={`line-${node.id}`}>
                      {/* Glow line */}
                      <line
                        x1="0" y1="0"
                        x2={pos.x} y2={pos.y}
                        stroke={node.color}
                        strokeWidth="3"
                        strokeDasharray="5 4"
                        opacity={isActive ? 0.4 : 0}
                        filter="url(#line-glow)"
                        style={{ transition: "opacity 0.3s ease" }}
                      />
                      {/* Main line */}
                      <line
                        x1="0" y1="0"
                        x2={pos.x} y2={pos.y}
                        stroke={node.color}
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                        opacity={isActive ? 0.9 : 0}
                        style={{ transition: "opacity 0.3s ease" }}
                      />
                      {/* Animated travel dot */}
                      {isActive && (
                        <circle r="3" fill={node.color} opacity="0.9">
                          <animateMotion
                            dur="1.2s"
                            repeatCount="indefinite"
                            path={`M 0 0 L ${pos.x} ${pos.y}`}
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {orbitNodes.map((node, index) => {
                const pos = getNodePosition(index, orbitNodes.length, 140);
                return (
                  <div
                    key={node.id}
                    className="absolute"
                    style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                  >
                    {/* Counter-rotate to keep nodes upright */}
                    <div className="counter-rotate">
                      <OrbitNode
                        ref={(el) => (nodeRefs.current[index] = el)}
                        {...node}
                        isActive={activeNode === node.id}
                        isOtherActive={activeNode !== null && activeNode !== node.id}
                        onInteract={setActiveNode}
                        delay={400 + index * 100}
                        isVisible={hasAnimated}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active node info panel */}
            {activeNodeData && (
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
                style={{ minWidth: "160px" }}
              >
                <div
                  className="px-4 py-3 rounded-xl bg-black/90 border backdrop-blur-sm transition-all duration-300"
                  style={{ borderColor: `${activeNodeData.color}40` }}
                >
                  <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Selected</div>
                  <div className="text-white font-semibold text-sm">{activeNodeData.title}</div>
                  <div className="text-white/50 text-xs mt-1">{activeNodeData.description}</div>
                  {activeNodeData.status === "coming-soon" && (
                    <div
                      className="mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: `${activeNodeData.color}15`, color: activeNodeData.color, border: `1px solid ${activeNodeData.color}30` }}
                    >
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile: Horizontal scroll snap cards */}
        {isMobile && (
          <div className="md:hidden">
            {/* Hub + connecting line row */}
            <div className="flex flex-col items-center mb-6">
              <div
                ref={hubRef}
                className={cn(
                  "relative w-14 h-14 rounded-full",
                  "bg-gradient-to-br from-purple-500/20 to-cyan-500/20",
                  "border border-white/20 backdrop-blur-sm",
                  "flex items-center justify-center"
                )}
                style={{ opacity: 0, transform: "scale(0)" }}
              >
                <div className="absolute inset-0 rounded-full border border-cyan-500/40 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <img src={oneappLogo} alt="OneApp" className="w-6 h-6 object-contain" />
                </div>
              </div>
              {/* Connector line */}
              <div className="w-px h-5 bg-gradient-to-b from-cyan-500/40 to-transparent mt-1" />
            </div>

            {/* Horizontal scroll container */}
            <div
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 px-6"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {orbitNodes.map((node, index) => {
                const Icon = node.icon;
                const isActive = activeNode === node.id;
                const isComingSoon = node.status === "coming-soon";
                return (
                  <button
                    key={node.id}
                    ref={(el) => (nodeRefs.current[index] = el)}
                    className={cn(
                      "snap-center shrink-0 flex flex-col items-center gap-3",
                      "w-[calc(50vw-28px)] min-w-[140px] max-w-[160px]",
                      "p-4 rounded-2xl border transition-all duration-300",
                      "text-left active:scale-[0.97]",
                      isActive
                        ? "bg-white/8 border-opacity-60"
                        : "bg-white/[0.03] border-white/10",
                      hasAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    )}
                    style={{
                      borderColor: isActive ? `${node.color}60` : undefined,
                      boxShadow: isActive ? `0 0 20px ${node.color}20` : undefined,
                      transitionDelay: hasAnimated ? `${index * 60}ms` : "0ms",
                    }}
                    onClick={() => setActiveNode(isActive ? null : node.id)}
                  >
                    {/* Icon box */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        "bg-[#0a0a12]/80 border transition-all duration-300",
                        isComingSoon ? "border-dashed border-white/15" : "border-white/10",
                        isActive ? "border-opacity-100" : ""
                      )}
                      style={{
                        borderColor: isActive ? node.color : undefined,
                        boxShadow: isActive ? `0 0 16px ${node.color}40` : undefined,
                      }}
                    >
                      <Icon
                        className="w-5 h-5 transition-colors duration-300"
                        style={{ color: isActive ? node.color : isComingSoon ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)" }}
                      />
                    </div>

                    {/* Text */}
                    <div className="w-full">
                      <div
                        className="text-sm font-semibold leading-tight transition-colors duration-200"
                        style={{ color: isActive ? node.color : "rgba(255,255,255,0.85)" }}
                      >
                        {node.title}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5 leading-snug">
                        {node.description}
                      </div>
                      {isComingSoon && (
                        <div
                          className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${node.color}12`,
                            color: node.color,
                            border: `1px solid ${node.color}25`,
                          }}
                        >
                          Soon
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scroll hint dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {orbitNodes.map((node, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: activeNode === node.id ? node.color : "rgba(255,255,255,0.2)",
                    transform: activeNode === node.id ? "scale(1.4)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Swipe hint */}
            <p className="text-center text-[11px] text-white/25 mt-3 tracking-wider">
              swipe to explore
            </p>
          </div>
        )}

        {/* Bottom tagline */}
        <div
          className={cn(
            "text-center mt-12 md:mt-20",
            "transition-all duration-700 ease-out",
            hasBeenVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "800ms" }}
        >
          <p className="text-white/40 text-sm tracking-wide">
            4 apps live · 2 coming soon ·{" "}
            <span className="text-cyan-400">Your ecosystem, expanding.</span>
          </p>
        </div>
      </div>

      {/* CSS keyframes for perfectly-synced orbit + counter-rotation */}
      <style>{`
        @keyframes ecosystem-orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ecosystem-orbit-counter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </section>
  );
}
