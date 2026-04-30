import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuthSource } from "@/hooks/useAuthSource";
import { hasCachedSystemConnection } from "@/hooks/useSystemConnection";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, Database } from "lucide-react";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import oneappLogo from "@/assets/oneapp-logo.png";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const { signIn, user, isLoading: authLoading, authMode, hasExternalConnection } = useAuthSource();

  // Check for cached connection (works when logged out)
  const hasCachedConnection = hasCachedSystemConnection();

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Handle lockout countdown
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      // Reset after lockout expires
      setFailedAttempts(0);
    }
  }, [lockoutTimer, failedAttempts]);

  const validateForm = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      toast.error(`Too many attempts. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        // Increment failed attempts
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTimer(30); // 30 seconds lockout
          toast.error("Too many failed attempts. Account temporarily locked for 30s.");
        } else {
          const errorMsg = result.error.message;
          if (errorMsg.includes("Invalid email or password")) {
            toast.error(t("login.errorInvalid"));
          } else if (errorMsg.includes("deactivated")) {
            toast.error(t("login.errorDeactivated"));
          } else {
            toast.error(errorMsg || t("login.errorGeneric"));
          }
        }
      } else {
        // Reset on success
        setFailedAttempts(0);
        toast.success(t("login.welcomeBack"));
        navigate("/");
      }
    } catch {
      toast.error(t("login.errorNetwork"));
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Language Switcher - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home */}
        <Button
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 animate-fade-up"
          onClick={() => navigate("/explore")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("nav.backToHome")}
        </Button>

        {/* Login Card */}
        <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-fade-in-scale hover:border-white/20 transition-all duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-up delay-100">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-cyan-500/30 scale-150 group-hover:bg-cyan-500/50 transition-all duration-500" />
              <img src={oneappLogo} alt="OneApp" className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 animate-fade-up delay-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {t("login.title")}
            </h1>
            <p className="text-white/50 text-sm">
              {t("login.subtitle")}
            </p>
          </div>

          {/* External connection indicator - show when connected or cached */}
          {(hasExternalConnection || hasCachedConnection) && (
            <div className="mb-6 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-fade-up delay-250">
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Database className="w-3.5 h-3.5" />
                <span className="font-medium">{t("login.dataSyncEnabled")}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-fade-up delay-300">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <Input
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${errors.email ? "border-red-500" : ""
                    }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 animate-fade-up">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2 animate-fade-up delay-400">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${errors.password ? "border-red-500" : ""
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

            <div className="flex items-center justify-between animate-fade-up delay-500">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 transition-all duration-300"
                />
                <label htmlFor="remember" className="text-sm text-white/50 cursor-pointer hover:text-white/70 transition-colors duration-300">
                  Remember me
                </label>
              </div>
              <Link to="/auth/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                {t("login.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 animate-fade-up delay-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t("login.submit")
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-white/50 text-sm animate-fade-up delay-700">
            {t("login.noAccount")}{" "}
            <Link to="/auth/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300">
              {t("login.signupLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
