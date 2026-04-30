import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Zap, Map, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthSource } from "@/hooks/useAuthSource";
import { CounterPreloader } from "@/components/explore/CounterPreloader";
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
import { useAppStore, STORE_MODULES } from "@/hooks/useAppStore";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/icons/AppIcon";

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSource();
  const [showPreloader, setShowPreloader] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Explore the magic of technology";

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
    if (showPreloader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPreloader]);

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
      href: "/features",
    },
    {
      title: "The Journey",
      description: "From idea to reality – our story and vision for the future.",
      icon: Map,
      href: "/about",
    },
    {
      title: "Intel Forum",
      description: "Exclusive access to insights, updates, and community discussions.",
      icon: Users,
      href: "/community",
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
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Star Background */}
      <ParticleBackground />

      {/* Preloader */}
      {showPreloader && <CounterPreloader onComplete={handlePreloaderComplete} />}

      {/* Fixed Header - Always on top, separate from scrollable content */}
      <SharedHeader variant="floating" visible={headerVisible} />

      {/* Main Content */}
      <div
        className={`transition-all duration-700 ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        {/* Hero Section — use svh for mobile browser chrome support */}
        <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
          <GradientBlobs />

          <div className="relative z-10 text-center px-5 sm:px-8 w-full max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-5 sm:mb-6 bg-white/10 text-white/80 border-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">
              Welcome to OneApp 2.0
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.05]">
              <span className="block">ONE SYSTEM</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
                INFINITE CONTROL
              </span>
            </h1>

            {/* Typing Subtitle */}
            <p className="mt-4 sm:mt-6 text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-wide h-6 sm:h-7">
              {typedText}
              {showCursor && (
                <span className="inline-block w-[2px] h-4 sm:h-5 bg-cyan-400 ml-1 animate-pulse" />
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
              <div className="w-px h-8 bg-gradient-to-b from-cyan-500/60 to-transparent" />
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1L6 6L11 1" stroke="rgba(0,240,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        {/* Section 2: Core Values Constellation - Only mount after preloader */}
        {!showPreloader && <CoreValuesSection key={location.key} />}

        {/* Section 3: Ecosystem Orbit */}
        {!showPreloader && <EcosystemOrbitSection />}

        {/* Section 4: Stats */}
        {!showPreloader && <StatsSection />}

        {/* Section 5: Features Grid */}
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