import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import oneappLogo from "@/assets/oneapp-logo.png";

interface SignUpLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackToHome?: boolean;
  backPath?: string;
  backLabel?: string;
}

export function SignUpLayout({
  children,
  title,
  subtitle,
  showBackToHome = true,
  backPath = "/explore",
  backLabel = "Back to Home",
}: SignUpLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Back Button */}
        {showBackToHome && (
          <Button
            variant="ghost"
            className="mb-6 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 animate-fade-up"
            onClick={() => navigate(backPath)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        )}

        {/* Main Card */}
        <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 animate-fade-in-scale hover:border-white/20 transition-all duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-up delay-100">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-cyan-500/30 scale-150 group-hover:bg-cyan-500/50 transition-all duration-500" />
              <img
                src={oneappLogo}
                alt="OneApp"
                className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8 animate-fade-up delay-200">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            {subtitle && <p className="text-white/50 text-sm">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
