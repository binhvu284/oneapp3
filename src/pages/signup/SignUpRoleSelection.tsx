import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Code, Handshake, Users } from "lucide-react";
import { SignUpLayout } from "@/components/signup/SignUpLayout";
import { SignUpRoleCard } from "@/components/signup/SignUpRoleCard";
import { useAuthSource } from "@/hooks/useAuthSource";
import { Loader2 } from "lucide-react";

export default function SignUpRoleSelection() {
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
      title="Join OneApp"
      subtitle="Select your account type to get started"
    >
      {/* Role Cards - Vertical Stack */}
      <div className="flex flex-col gap-2.5 max-w-md mx-auto mb-6">
        <SignUpRoleCard
          icon={Code}
          title="OneApp Developer"
          description="For team members and developers working on OneApp projects. Requires admin-provided credentials."
          onClick={() => navigate("/auth/signup/developer")}
          delay="delay-300"
          gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
          hoverGradient="bg-gradient-to-br from-blue-500/10 to-cyan-500/10"
        />

        <SignUpRoleCard
          icon={Handshake}
          title="OneApp Partner"
          description="For business partners with a partner key or verified email. Register to access partner benefits."
          onClick={() => navigate("/auth/signup/partner")}
          delay="delay-400"
          gradient="bg-gradient-to-br from-purple-500 to-pink-500"
          hoverGradient="bg-gradient-to-br from-purple-500/10 to-pink-500/10"
        />

        <SignUpRoleCard
          icon={Users}
          title="OneApp Customer"
          description="Access OneApp's SaaS features and services. Create your personal account to get started."
          isLocked
          lockText="Coming Soon"
          delay="delay-500"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
          hoverGradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/10"
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
