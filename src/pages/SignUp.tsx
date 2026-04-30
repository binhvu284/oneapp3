import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuthSource } from "@/hooks/useAuthSource";
import { hasCachedSystemConnection } from "@/hooks/useSystemConnection";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Database } from "lucide-react";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import oneappLogo from "@/assets/oneapp-logo.png";

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [typedText, setTypedText] = useState("");

  const { signUp, user, isLoading: authLoading, hasExternalConnection } = useAuthSource();
  
  // Check for cached connection (works when logged out)
  const hasCachedConnection = hasCachedSystemConnection();
  
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tagline = "Explore More. Build More. Achieve More.";

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Debug logging for connection status
  useEffect(() => {
    console.log("[SignUp] Component mounted - connection status:");
    console.log("[SignUp] hasExternalConnection:", hasExternalConnection);
    console.log("[SignUp] hasCachedConnection:", hasCachedConnection);
  }, [hasExternalConnection, hasCachedConnection]);

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(tagline.slice(0, index + 1));
      index++;
      if (index >= tagline.length) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const validateForm = () => {
    const result = signUpSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { fullName?: string; email?: string; password?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        if (result.error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(result.error.message);
        }
      } else {
        if (result.syncedToExternal) {
          toast.success("Account created and synced to External Database!");
        } else {
          toast.success(t("signup.success"));
        }
        navigate("/");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex relative overflow-hidden">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left Column - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 relative z-10">
        <div className="max-w-md">
          {/* Back to Home */}
          <Button
            variant="ghost"
            className="mb-8 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 animate-slide-in-left"
            onClick={() => navigate("/explore")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("nav.backToHome")}
          </Button>

          {/* Logo and Title */}
          <div className="flex items-center gap-4 mb-8 animate-slide-in-left delay-100">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-purple-500/40 scale-150 group-hover:bg-purple-500/60 transition-all duration-500" />
              <img src={oneappLogo} alt="OneApp" className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-3xl font-bold text-white">OneApp</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-left delay-200">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              {t("signup.title")}
            </span>
          </h1>

          {/* Tagline with typewriter */}
          <p className="text-xl text-white/60 mb-6 animate-slide-in-left delay-300">
            {typedText}
            <span className="animate-pulse">|</span>
          </p>

          {/* Sign In Link */}
          <p className="text-white/50 animate-slide-in-left delay-400">
            {t("signup.hasAccount")}{" "}
            <Link to="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300">
              {t("signup.loginLink")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile: Back to Home */}
          <div className="lg:hidden mb-6 animate-fade-up">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => navigate("/explore")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("nav.backToHome")}
            </Button>
          </div>

          {/* Form Card */}
          <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-slide-in-right lg:animate-fade-in-scale hover:border-white/20 transition-all duration-500">
            {/* Mobile: Logo */}
            <div className="lg:hidden flex justify-center mb-6 animate-fade-up delay-100">
              <div className="relative group">
                <div className="absolute inset-0 blur-2xl bg-purple-500/30 scale-150 group-hover:bg-purple-500/50 transition-all duration-500" />
                <img src={oneappLogo} alt="OneApp" className="relative h-14 w-14 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>

            {/* Mobile: Title */}
            <div className="lg:hidden text-center mb-6 animate-fade-up delay-200">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                {t("signup.title")}
              </h1>
              <p className="text-white/50 text-sm">{t("signup.subtitle")}</p>
            </div>

            {/* External connection indicator - show when connected or cached */}
            {(hasExternalConnection || hasCachedConnection) && (
              <div className="mb-6 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg animate-fade-up delay-250">
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <Database className="w-4 h-4" />
                  <span className="font-medium">Dual Database Sync</span>
                </div>
                <p className="text-xs text-white/50 mt-1">
                  Your account will be created in both Lovable Cloud and External Supabase
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-fade-up delay-100 lg:delay-200">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
                  <Input
                    type="text"
                    placeholder={t("signup.namePlaceholder")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-400 animate-fade-up">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2 animate-fade-up delay-200 lg:delay-300">
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
                  <Input
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 animate-fade-up">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 animate-fade-up delay-300 lg:delay-400">
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signup.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 animate-fade-up">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2 animate-fade-up delay-400 lg:delay-500">
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("signup.confirmPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400 animate-fade-up">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium mt-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 animate-fade-up delay-500 lg:delay-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t("signup.submit")
                )}
              </Button>
            </form>

            {/* Mobile: Sign In Link */}
            <p className="lg:hidden text-center mt-6 text-white/50 text-sm animate-fade-up delay-600">
              {t("signup.hasAccount")}{" "}
              <Link to="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300">
                {t("signup.loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
