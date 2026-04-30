import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SettingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  badge?: string;
}

export function SettingCard({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  disabled,
  badge,
}: SettingCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "setting-card w-full text-left flex items-center gap-4 group hover:border-primary/50 transition-all",
        disabled && "opacity-60 cursor-not-allowed hover:border-border",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {description}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
