import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useLanguage } from "@/hooks/useLanguage";
import { getCachedSystemConnection } from "@/hooks/useSystemConnection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import oneappLogo from "@/assets/oneapp-logo.png";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step = "email" | "password" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }
    setErrors({});
    // Move to password step (we verify email exists on final submit for security)
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      // Include external datasource if cached
      const cached = getCachedSystemConnection();
      const body: Record<string, string> = {
        action: "reset-password",
        email: email.toLowerCase().trim(),
        password,
      };
      if (cached?.supabase_url && cached?.supabase_service_key && cached.is_active) {
        body.external_url = cached.supabase_url;
        body.external_service_key = cached.supabase_service_key;
      }

      const { data, error } = await supabase.functions.invoke("oneapp-auth", {
        body,
      });

      if (error || data?.error) {
        const msg = data?.error || error?.message || "";
        if (msg.includes("not found") || msg.includes("no account")) {
          toast.error(t("forgotPassword.notFound"));
        } else {
          toast.error(t("forgotPassword.errorGeneric"));
        }
      } else {
        setStep("success");
      }
    } catch {
      toast.error(t("login.errorNetwork"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 animate-fade-up"
          onClick={() => navigate("/auth/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("forgotPassword.backToLogin")}
        </Button>

        <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 animate-fade-in-scale hover:border-white/20 transition-all duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-up delay-100">
            <div className="relative group">
              <div className="absolute inset-0 blur-2xl bg-cyan-500/30 scale-150 group-hover:bg-cyan-500/50 transition-all duration-500" />
              <img src={oneappLogo} alt="OneApp" className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          {step === "success" ? (
            <div className="text-center space-y-4 animate-fade-up">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">{t("forgotPassword.successTitle")}</h1>
              <p className="text-white/50 text-sm">{t("forgotPassword.successDesc")}</p>
              <Link to="/auth/login">
                <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium mt-4">
                  {t("forgotPassword.backToLogin")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6 animate-fade-up delay-200">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {t("forgotPassword.title")}
                </h1>
                <p className="text-white/50 text-sm">
                  {step === "email" ? t("forgotPassword.subtitle") : t("forgotPassword.newPasswordSubtitle")}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`h-2 w-8 rounded-full transition-colors ${step === "email" ? "bg-cyan-500" : "bg-cyan-500/30"}`} />
                <div className={`h-2 w-8 rounded-full transition-colors ${step === "password" ? "bg-cyan-500" : "bg-cyan-500/30"}`} />
              </div>

              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div className="space-y-2 animate-fade-up delay-300">
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400" />
                      <Input
                        type="email"
                        placeholder={t("login.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-400 animate-fade-up">{errors.email}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 animate-fade-up delay-400"
                  >
                    {t("forgotPassword.continue")}
                  </Button>
                </form>
              )}

              {step === "password" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-2 animate-fade-up delay-200">
                    <p className="text-xs text-cyan-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {email}
                    </p>
                  </div>

                  <div className="space-y-2 animate-fade-up delay-300">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("forgotPassword.newPassword")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${errors.password ? "border-red-500" : ""}`}
                        disabled={isLoading}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 animate-fade-up">{errors.password}</p>}
                  </div>

                  <div className="space-y-2 animate-fade-up delay-400">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-cyan-400" />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder={t("forgotPassword.confirmPassword")}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] ${errors.confirmPassword ? "border-red-500" : ""}`}
                        disabled={isLoading}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 animate-fade-up">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex gap-3 animate-fade-up delay-500">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 h-12 text-white/60 hover:text-white hover:bg-white/10"
                      onClick={() => { setStep("email"); setErrors({}); }}
                      disabled={isLoading}
                    >
                      {t("nav.backToHome")}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("forgotPassword.submit")}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          {step !== "success" && (
            <p className="text-center mt-6 text-white/50 text-sm animate-fade-up delay-700">
              {t("forgotPassword.rememberPassword")}{" "}
              <Link to="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300">
                {t("login.submit")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
