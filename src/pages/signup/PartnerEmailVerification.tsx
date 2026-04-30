import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpLayout } from "@/components/signup/SignUpLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSource } from "@/hooks/useAuthSource";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function PartnerEmailVerification() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthSource();
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleVerify = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke("oneapp-auth", {
        body: { action: "verify-partner-email", email: email.trim().toLowerCase() },
      });

      if (error || !data?.valid) {
        setError(data?.error || "Email not found in approved partner list.");
        setIsVerifying(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/auth/signup/partner/register", {
          state: { verificationType: "email", verifiedEmail: email.trim().toLowerCase(), emailLocked: true, verifiedEmailId: data.verified_email_id },
        });
      }, 500);
    } catch {
      setError("Verification failed. Please try again.");
    }

    setIsVerifying(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <SignUpLayout
      title="Verified Email"
      subtitle="Check if your email is pre-approved for partner registration"
      backPath="/auth/signup/partner"
      backLabel="Back to Verification Options"
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Email Icon */}
        <div className="flex justify-center animate-fade-up delay-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-white/60 text-sm animate-fade-up delay-400">
          If your email address has been pre-approved in our partner list, you can
          proceed to register your OneApp partner account directly.
        </p>

        {/* Input Form */}
        <div className="space-y-4 animate-fade-up delay-500">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 transition-colors duration-300 group-focus-within:text-emerald-400" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 transition-all duration-300 hover:border-white/20 focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] ${
                error ? "border-red-500" : ""
              } ${success ? "border-emerald-500" : ""}`}
              disabled={isVerifying || success}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm animate-fade-up">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm animate-fade-up">
              <CheckCircle className="w-4 h-4" />
              Email verified! Redirecting to registration...
            </div>
          )}

          <Button
            onClick={handleVerify}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
            disabled={isVerifying || success}
          >
            {isVerifying ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Verified
              </>
            ) : (
              <>
                Check Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-center text-white/40 text-xs animate-fade-up delay-600">
          Your email not in the approved list? Contact your OneApp representative or{" "}
          <button
            onClick={() => navigate("/auth/signup/partner/key")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            try partner key verification
          </button>
        </p>
      </div>
    </SignUpLayout>
  );
}
