import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpLayout } from "@/components/signup/SignUpLayout";
import { Button } from "@/components/ui/button";
import { useAuthSource } from "@/hooks/useAuthSource";
import { Loader2, MessageCircle, LogIn, ArrowRight } from "lucide-react";

export default function DeveloperInfo() {
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
      title="Join as OneApp Developer"
      subtitle="Access for team members and developers"
      backPath="/auth/signup"
      backLabel="Back to Role Selection"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Info Card 1 - Contact Admin */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-fade-up delay-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Don't have an account yet?
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                If you're a developer and don't have an OneApp account, please contact
                your <span className="text-cyan-400">partner</span>,{" "}
                <span className="text-cyan-400">mentor</span>,{" "}
                <span className="text-cyan-400">manager</span>, or{" "}
                <span className="text-cyan-400">OneApp admin</span> you're working with
                to receive your access credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Info Card 2 - Already Have Account */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-fade-up delay-400">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Already have credentials?
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                If your account has been created by an administrator, you can proceed
                to sign in with your provided credentials.
              </p>
              <Button
                onClick={() => navigate("/auth/login")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:-translate-y-0.5"
              >
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center animate-fade-up delay-500">
          <p className="text-white/40 text-xs">
            Developer accounts are managed by OneApp administrators for security purposes.
            <br />
            This ensures proper access control and team management.
          </p>
        </div>
      </div>
    </SignUpLayout>
  );
}
