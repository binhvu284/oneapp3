import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface BackNavigationProps {
  to: string;
  label: string;
}

export function BackNavigation({ to, label }: BackNavigationProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
