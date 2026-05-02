import { useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import oneappLogo from "@/assets/oneapp-logo.png";

interface NavItem {
  label: string;
  labelKey: string;
  href: string;
}

interface SharedHeaderProps {
  variant?: "floating" | "standard";
  visible?: boolean;
}

const navItems: NavItem[] = [
  { label: "Ecosystem", labelKey: "nav.features", href: "/ecosystem" },
  { label: "Journey", labelKey: "nav.about", href: "/journey" },
  { label: "Pricing", labelKey: "nav.pricing", href: "/pricing" },
  { label: "Changelog", labelKey: "nav.changelog", href: "/changelog" },
  { label: "Docs", labelKey: "nav.docs", href: "/docs" },
];

export function SharedHeader({ variant = "standard", visible = true }: SharedHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [spotlightStyle, setSpotlightStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);

  const updateSpotlight = (index: number) => {
    const button = navRefs.current[index];
    const nav = navRef.current;
    if (button && nav) {
      const buttonRect = button.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      setSpotlightStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
        opacity: 1,
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
    updateSpotlight(index);
  };

  const handleMouseLeave = () => {
    setSpotlightStyle((prev) => ({ ...prev, opacity: 0 }));
    setActiveIndex(null);
  };

  const isCurrentPage = (href: string) => location.pathname === href;

  if (variant === "floating") {
    return (
      <header
        className={`fixed top-6 left-0 right-0 z-50 px-4 ${
          visible ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`mx-auto max-w-4xl flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#050814]/90 via-[#0a0f2a]/95 to-[#050814]/90 backdrop-blur-2xl border border-indigo-500/30 rounded-full relative shadow-[0_0_30px_rgba(99,102,241,0.2),0_0_60px_rgba(99,102,241,0.07)] ${
            visible ? "animate-header-reveal" : "opacity-0 scale-x-0"
          }`}
        >
          {/* Logo + OneApp */}
          <button
            onClick={() => navigate("/explore")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={oneappLogo} alt="OneApp" className="w-7 h-7" />
            <span className="text-white font-bold text-lg tracking-wider">OneApp</span>
          </button>

          {/* Navigation with Spotlight */}
          <nav
            ref={navRef}
            className="hidden md:flex items-center gap-1 relative py-1"
            onMouseLeave={handleMouseLeave}
          >
            {/* Spotlight pill */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[calc(100%-8px)] bg-white/10 rounded-full transition-all duration-200 ease-out pointer-events-none"
              style={{
                left: spotlightStyle.left,
                width: spotlightStyle.width,
                opacity: spotlightStyle.opacity,
              }}
            />

            {navItems.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => (navRefs.current[index] = el)}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => handleMouseEnter(index)}
                className={`relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeIndex === index ? "text-indigo-400" : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10 active:bg-white/15">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(280px,85vw)] bg-[#050814]/98 backdrop-blur-xl border-l border-indigo-500/20 p-0"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src={oneappLogo} alt="OneApp" className="w-6 h-6" />
                  <span className="text-white font-bold">OneApp</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col p-3 gap-0.5">
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-3.5 text-white/70 hover:text-indigo-400 hover:bg-white/5 active:bg-white/10 rounded-xl transition-all duration-200 text-left text-sm font-medium animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Mobile Get Start Button */}
              <div className="absolute bottom-8 left-4 right-4 space-y-2">
                <button
                  onClick={() => {
                    navigate("/auth/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-white/90 active:bg-white/80 transition-colors"
                >
                  Get Started
                </button>
                <p className="text-center text-xs text-white/30">
                  OneApp v3.0
                </p>
              </div>
            </SheetContent>
          </Sheet>

          {/* Get Start Button - Desktop */}
          <button
            onClick={() => navigate("/auth/login")}
            className="hidden md:block px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            Get Start
          </button>
        </div>

        <style>{`
          @keyframes header-reveal {
            0% {
              opacity: 0;
              transform: scaleX(0) translateY(-10px);
            }
            50% {
              opacity: 1;
              transform: scaleX(1) translateY(-5px);
            }
            100% {
              opacity: 1;
              transform: scaleX(1) translateY(0);
            }
          }
          .animate-header-reveal {
            animation: header-reveal 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: center;
          }
        `}</style>
      </header>
    );
  }

  // Standard variant
  return (
    <header className="relative z-10 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/explore" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg group-hover:bg-primary/50 transition-all duration-300" />
            <img src={oneappLogo} alt="OneApp" className="h-10 w-10 relative z-10" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            OneApp
          </span>
        </Link>

        {/* Navigation with Spotlight for standard variant */}
        <nav
          ref={navRef}
          className="hidden md:flex items-center gap-1 relative py-1"
          onMouseLeave={handleMouseLeave}
        >
          {/* Spotlight pill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[calc(100%-8px)] bg-primary/10 rounded-full transition-all duration-200 ease-out pointer-events-none"
            style={{
              left: spotlightStyle.left,
              width: spotlightStyle.width,
              opacity: spotlightStyle.opacity,
            }}
          />

          {/* Home link */}
          <Link
            to="/explore"
            className="relative z-10 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("nav.home")}
          </Link>

          {navItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.href}
              ref={(el) => (navRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isCurrentPage(item.href)
                  ? "text-primary"
                  : activeIndex === index
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu for Standard variant */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] bg-background/95 backdrop-blur-xl border-l border-border p-0"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center gap-2 p-6 border-b border-border">
              <img src={oneappLogo} alt="OneApp" className="w-6 h-6" />
              <span className="text-foreground font-bold">OneApp</span>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col p-4 gap-1">
              <button
                onClick={() => {
                  navigate("/explore");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-4 py-3 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200 text-left animate-fade-in"
              >
                {t("nav.home")}
              </button>
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-4 py-3 hover:bg-muted rounded-lg transition-all duration-200 text-left animate-fade-in ${
                    isCurrentPage(item.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="absolute bottom-6 left-4 right-4 space-y-2">
              <button
                onClick={() => {
                  navigate("/auth/login");
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors"
              >
                {t("nav.getStarted")}
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/auth/login">
            <Button variant="ghost" className="hover-scale-smooth">
              {t("nav.login")}
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button className="btn-gradient-animated">
              {t("nav.getStarted")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
