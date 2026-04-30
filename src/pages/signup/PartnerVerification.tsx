import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Key, Mail, MoreHorizontal, Lock } from "lucide-react";
import { SignUpLayout } from "@/components/signup/SignUpLayout";
import { SignUpRoleCard } from "@/components/signup/SignUpRoleCard";
import { useAuthSource } from "@/hooks/useAuthSource";
import { Loader2 } from "lucide-react";

export default function PartnerVerification() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthSource();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <SignUpLayout
      title="Partner Verification"
      subtitle="Verify your partner status to create an account"
      backPath="/auth/signup"
      backLabel="Back to Role Selection"
    >
      {/* Verification Options - Vertical Stack */}
      <div className="flex flex-col gap-2.5 max-w-md mx-auto mb-6">
        <SignUpRoleCard
          icon={Key}
          title="Enter Partner Key"
          description="Have a partner key? Enter it to proceed with your registration process."
          onClick={() => navigate("/auth/signup/partner/key")}
          delay="delay-300"
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          hoverGradient="bg-gradient-to-br from-amber-500/10 to-orange-500/10"
        />

        <SignUpRoleCard
          icon={Mail}
          title="Verified Email"
          description="If your email is pre-approved in our partner list, you can register directly."
          onClick={() => navigate("/auth/signup/partner/email")}
          delay="delay-400"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          hoverGradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
        />

        <SignUpRoleCard
          icon={MoreHorizontal}
          title="Other Methods"
          description="Additional verification options will be available soon for partner registration."
          isLocked
          lockText="Coming Soon"
          delay="delay-500"
          gradient="bg-gradient-to-br from-slate-500 to-slate-600"
          hoverGradient="bg-gradient-to-br from-slate-500/10 to-slate-600/10"
        />
      </div>

      {/* Sign In Link */}
      <p className="text-center text-white/50 text-sm animate-fade-up delay-600">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300"
        >
          Sign In
        </Link>
      </p>
    </SignUpLayout>
  );
}
