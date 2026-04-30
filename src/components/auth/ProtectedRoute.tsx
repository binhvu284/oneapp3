import { Navigate, Outlet } from "react-router-dom";
import { useAuthSource } from "@/hooks/useAuthSource";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { user, isLoading } = useAuthSource();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
