import { Mail, Phone, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactInfoProps {
  email?: string;
  phone?: string | null;
  isLoading?: boolean;
}

export function ContactInfo({ email, phone, isLoading }: ContactInfoProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-5 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Contact Information
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings/account")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">
              {email || "Not set"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-foreground">
              {phone || "Not set"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
