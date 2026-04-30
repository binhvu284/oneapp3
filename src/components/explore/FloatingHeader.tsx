import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import oneappLogo from "@/assets/oneapp-logo.png";

interface NavItem {
  label: string;
  href: string;
}

interface FloatingHeaderProps {
  visible?: boolean;
}

export function FloatingHeader({ visible = true }: FloatingHeaderProps) {
  const navigate = useNavigate();
  const [spotlightStyle, setSpotlightStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);

  const navItems: NavItem[] = [
    { label: "Ecosystem", href: "/features" },
    { label: "Journey", href: "/about" },
    { label: "Forum", href: "/community" },
  ];

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

  return (
    <header
      className={`fixed top-6 left-0 right-0 z-50 px-4 ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      <div
        className={`mx-auto max-w-4xl flex items-center justify-between px-6 py-3 bg-gradient-to-r from-black/80 via-gray-900/90 to-black/80 backdrop-blur-2xl border border-cyan-500/30 rounded-full relative shadow-[0_0_30px_rgba(6,182,212,0.15),0_0_60px_rgba(6,182,212,0.05)] ${
          visible ? "animate-header-reveal" : "opacity-0 scale-x-0"
        }`}
      >
        {/* Logo + OneApp (clickable to /explore) */}
        <button
          onClick={() => navigate("/explore")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={oneappLogo} alt="OneApp" className="w-7 h-7" />
          <span className="text-white font-bold text-lg tracking-wider">OneApp</span>
        </button>

        {/* Navigation with Spotlight */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 relative py-1" onMouseLeave={handleMouseLeave}>
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
                activeIndex === index ? "text-cyan-400" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Get Start Button */}
        <button
          onClick={() => navigate("/auth/login")}
          className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-white/90 transition-colors"
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
