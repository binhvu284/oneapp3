import { FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface BioSectionProps {
  bio?: string | null;
  isLoading?: boolean;
}

export function BioSection({ bio, isLoading }: BioSectionProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-5 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="p-5 bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Bio</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings/profile")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {bio ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          No bio added yet.{" "}
          <button
            onClick={() => navigate("/settings/profile")}
            className="text-primary hover:underline"
          >
            Add one now
          </button>
        </p>
      )}
    </div>
  );
}
