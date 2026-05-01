import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, Map, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthSource } from "@/hooks/useAuthSource";
import { CounterPreloader } from "@/components/explore/CounterPreloader";
import { CinematicIntro } from "@/components/explore/CinematicIntro";
import { SharedHeader } from "@/components/explore/SharedHeader";
import { GradientBlobs } from "@/components/explore/GradientBlobs";
import { NavigationCard } from "@/components/explore/NavigationCard";
import { SimpleFooter } from "@/components/explore/SimpleFooter";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { RevealSection } from "@/components/explore/RevealSection";
import { CoreValuesSection } from "@/components/explore/CoreValuesSection";
import { EcosystemOrbitSection } from "@/components/explore/EcosystemOrbitSection";
import { StatsSection } from "@/components/explore/StatsSection";
import { FeaturesGridSection } from "@/components/explore/FeaturesGridSection";
import { ScrollProgressRail } from "@/components/explore/ScrollProgressRail";
import { DashboardMockup3D } from "@/components/explore/DashboardMockup3D";
import { ComparisonSection } from "@/components/explore/ComparisonSection";
import { FeatureDemoSection } from "@/components/explore/FeatureDemoSection";
import { EverythingConnectedSection } from "@/components/explore/EverythingConnectedSection";
import { useAppStore, STORE_MODULES } from "@/hooks/useAppStore";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useKonamiCode } from "@/hooks/useKonamiCode";

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSource();

  // Show CinematicIntro on first session visit; show CounterPreloader on return visits
  const [introDone] = useState(
    () => typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("oneapp-v3-intro-seen") === "1"
      : true
  );
  // Always start true — either CinematicIntro or CounterPreloader acts as the gating preloader
  const [showPreloader, setShowPreloader] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [konamiBurst, setKonamiBurst] = useState(false);
  const reduceMotion = useReducedMotion();
  const fullText = "Explore the magic of technology";

  useDocumentMeta({
    title: "OneApp — One System, Infinite Control",
    description:
      "OneApp is the founder's operating system: notes, tasks, AI, crypto, deploys — all in one personal workspace.",
    canonicalPath: "/explore",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "OneApp",
          url: typeof window !== "undefined" ? window.location.origin : "https://oneapp.app",
        },
        {
          "@type": "WebSite",
          name: "OneApp",
          url: typeof window !== "undefined" ? window.location.origin : "https://oneapp.app",
        },
      ],
    },
  });

  useKonamiCode(() => {
    if (reduceMotion) return;
    setKonamiBurst(true);
    // eslint-disable-next-line no-console
    console.log("%c⌁ founder mode unlocked ⌁", "color:#00F0FF;font-weight:700;");
    setTimeout(() => setKonamiBurst(false), 2400);
  });

  const startTyping = useCallback(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Hide cursor after typing completes
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 50);
    return typingInterval;
  }, []);

  // Force scroll to top immediately on mount (before any render)
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showPreloader || !introDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPreloader, introDone]);

  const { installedApps, toggleApp } = useAppStore();

  const handlePreloaderComplete = () => {
    // Scroll to top when preloader completes (extra safety)
    window.scrollTo(0, 0);
    setShowPreloader(false);
    // Header appears first
    setTimeout(() => setHeaderVisible(true), 100);
    // Then hero section
    setTimeout(() => setContentVisible(true), 500);
    // Start typing effect after content is visible
    setTimeout(() => startTyping(), 1200);
  };

  const navigationCards = [
    {
      title: "The Ecosystem",
      description: "Core technologies and spin-offs that power your experience.",
      icon: Zap,
      href: "/ecosystem",
    },
    {
      title: "The Journey",
      description: "From idea to reality – our story and vision for the future.",
      icon: Map,
      href: "/journey",
    },
    {
      title: "Intel Forum",
      description: "Exclusive access to insights, updates, and community discussions.",
      icon: Users,
      href: "/forum",
    },
  ];

  if (user) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20 px-6">
        <SharedHeader variant="floating" visible={true} />
        <div className="max-w-6xl mx-auto py-12 pt-24">
          <h1 className="text-3xl font-bold mb-2">App Store</h1>
          <p className="text-muted-foreground mb-8">Enhance your OneApp experience by installing additional modules.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORE_MODULES.map(app => {
              const isInstalled = installedApps.includes(app.id);
              return (
                <div key={app.id} className="border border-border bg-card rounded-xl p-6 flex flex-col items-start gap-4 hover:border-primary/50 transition-all shadow-sm">
                  <div className="p-3 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <AppIcon route={app.url} size="md" showBackground={false} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold border-b-0 pb-0">{app.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                  </div>
                  <div className="mt-auto pt-4 w-full flex items-center justify-between border-t border-border/50">
                    <div className="text-xs text-muted-foreground">Ver {app.version} • {app.author}</div>
                    <Button
                      variant={isInstalled ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleApp(app.id)}
                    >
                      {isInstalled ? "Uninstall" : "Install"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-white overflow-x-hidden relative">
      {/* Star Background */}
      <ParticleBackground />

      {/* Cinematic intro — first session visit only */}
      {!introDone && (
        <CinematicIntro onComplete={handlePreloaderComplete} />
      )}

      {/* Counter preloader — return visits */}
      {introDone && showPreloader && <CounterPreloader onComplete={handlePreloaderComplete} />}

      {/* Fixed Header - Always on top, separate from scrollable content */}
      <SharedHeader variant="floating" visible={headerVisible} />

      {/* Scroll storytelling rail (desktop only, motion users only) */}
      {!showPreloader && <ScrollProgressRail />}

      {/* Konami easter egg overlay */}
      {konamiBurst && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 animate-[konami-flash_2.4s_ease-out_forwards]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,240,255,0.18) 0%, transparent 60%)",
          }}
        />
      )}
      <style>{`
        @keyframes konami-flash {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes hero-word-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-word {
          display: inline-block;
          opacity: 0;
          animation: hero-word-in 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-word { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Main Content */}
      <div
        className={`transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        {/* Hero Section — use svh for mobile browser chrome support */}
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          {/* Cyberpunk grid overlay */}
          <div className="absolute inset-0 bg-cyber-grid opacity-100 pointer-events-none" />
          {/* Radial vignette to fade grid at edges */}
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, #050814 100%)" }} />
          <GradientBlobs />

          <div className="relative z-10 text-center px-5 sm:px-8 w-full max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-5 sm:mb-6 bg-indigo-500/10 text-indigo-300 border-indigo-500/30 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              Welcome to OneApp 3.0
            </Badge>

            {/* Main Headline — word-by-word staggered entrance */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="block text-glow-brand">
                {"ONE SYSTEM".split(" ").map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    className="hero-word mr-3"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
              <span className="block text-gradient-brand">
                {"INFINITE CONTROL".split(" ").map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    className="hero-word mr-3"
                    style={{ animationDelay: `${(i + 2) * 80}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            {/* Typing Subtitle */}
            <p className="mt-4 sm:mt-6 text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-wide h-6 sm:h-7">
              {typedText}
              {showCursor && (
                <span className="inline-block w-[2px] h-4 sm:h-5 bg-indigo-400 ml-1 animate-pulse" />
              )}
            </p>

            {/* CTA hint on mobile */}
            <p className="sm:hidden mt-4 text-white/25 text-[11px] tracking-widest uppercase">
              scroll to explore
            </p>
          </div>

          {/* Scroll Indicator — desktop */}
          <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5">
            <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase">scroll</span>
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <div className="w-px h-8 bg-gradient-to-b from-indigo-500/60 to-transparent" />
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1L6 6L11 1" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        {/* 3D Dashboard Mockup */}
        {!showPreloader && (
          <section className="relative px-4 sm:px-6 pb-16 sm:pb-24">
            <DashboardMockup3D />
          </section>
        )}

        {/* Section 2: Core Values Constellation - Only mount after preloader */}
        {!showPreloader && <CoreValuesSection key={location.key} />}

        {/* Section 3: v2 vs v3 Comparison */}
        {!showPreloader && <ComparisonSection />}

        {/* Section 4: Interactive Feature Demos */}
        {!showPreloader && <FeatureDemoSection />}

        {/* Section 5: Everything Connected — showstopper orbit */}
        {!showPreloader && <EverythingConnectedSection />}

        {/* Section 6: Ecosystem Orbit */}
        {!showPreloader && <EcosystemOrbitSection />}

        {/* Section 7: Stats */}
        {!showPreloader && <StatsSection />}

        {/* Section 8: Features Grid */}
        {!showPreloader && <FeaturesGridSection />}

        {/* Navigation Cards Section */}
        <RevealSection animation="blur" className="py-14 sm:py-24 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
              {navigationCards.map((card, index) => (
                <RevealSection key={card.title} animation="up" delay={index * 150}>
                  <NavigationCard
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    href={card.href}
                    delay={0}
                  />
                </RevealSection>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Footer */}
        <SimpleFooter />
      </div>
    </div>
  );
}