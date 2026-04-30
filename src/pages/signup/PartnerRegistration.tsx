import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { SignUpLayout } from "@/components/signup/SignUpLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthSource } from "@/hooks/useAuthSource";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  ArrowRight,
  CheckCircle,
  Shield,
} from "lucide-react";

const registrationSchema = z
  .object({
    fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().trim().email({ message: "Please enter a valid email address" }),
    company: z.string().optional(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface LocationState {
  verificationType?: "key" | "email";
  partnerKey?: string;
  verifiedEmail?: string;
  emailLocked?: boolean;
}

export default function PartnerRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { signUp, user, isLoading: authLoading } = useAuthSource();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(state?.verifiedEmail || "");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const isEmailLocked = state?.emailLocked || false;

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
      setFailedAttempts(0);
    }
  }, [lockoutTimer, failedAttempts]);

  // Redirect if no verification state
  useEffect(() => {
    if (!state?.verificationType) {
      // For UI testing, allow direct access
      // In production, uncomment the following:
      // navigate("/auth/signup/partner");
    }
  }, [state, navigate]);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Medium", color: "bg-amber-500" };
    return { strength, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const result = registrationSchema.safeParse({
      fullName,
      email,
      company,
      password,
      confirmPassword,
      agreeTerms,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
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
    if (lockoutTimer > 0) {
      toast.error(`Too many attempts. Please wait ${lockoutTimer} seconds.`);
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signUp(email, password, fullName);
      if (result.error) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTimer(30);
          toast.error("Too many failed attempts. Account temporarily locked for 30s.");
        } else {
          if (result.error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(result.error.message);
          }
        }
      } else {
        setFailedAttempts(0);
        toast.success("Partner account created successfully! Welcome to OneApp.");
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
    <SignUpLayout
      title="Create Partner Account"
      subtitle="Complete your registration to join OneApp as a partner"
      backPath="/auth/signup/partner"
      backLabel="Back to Verification"
    >
      <div className="max-w-lg mx-auto">
        {/* Verification Badge */}
        {state?.verificationType && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-fade-up delay-300">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Partner Verified</span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              {state.verificationType === "key"
                ? "Your partner key has been verified"
                : "Your email has been verified as a partner"}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2 animate-fade-up delay-400">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${errors.fullName ? "border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-400 animate-fade-up">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 animate-fade-up delay-450">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${errors.email ? "border-red-500" : ""
                  } ${isEmailLocked ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading || isEmailLocked}
              />
              {isEmailLocked && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
              )}
            </div>
            {isEmailLocked && (
              <p className="text-xs text-emerald-400">
                <CheckCircle className="inline w-3 h-3 mr-1" />
                This email is verified and locked for your registration
              </p>
            )}
            {errors.email && (
              <p className="text-xs text-red-400 animate-fade-up">{errors.email}</p>
            )}
          </div>

          {/* Company (Optional) */}
          <div className="space-y-2 animate-fade-up delay-500">
            <div className="relative group">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
              <Input
                type="text"
                placeholder="Company / Organization (Optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 animate-fade-up delay-550">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${errors.password ? "border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-white/10"
                        }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.color.replace("bg-", "text-")}`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-red-400 animate-fade-up">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2 animate-fade-up delay-600">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-purple-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] ${errors.confirmPassword ? "border-red-500" : ""
                  }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 animate-fade-up">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-2 animate-fade-up delay-650">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-1 border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-white/60 cursor-pointer leading-relaxed"
              >
                I agree to the{" "}
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </span>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-xs text-red-400 animate-fade-up">{errors.agreeTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium mt-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5 animate-fade-up delay-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Partner Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-white/50 text-sm animate-fade-up delay-800">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </SignUpLayout>
  );
}
