import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  borderColor?: string;
  className?: string;
  onClick?: () => void;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconBgColor = "bg-primary/20",
  borderColor = "border-l-primary",
  className,
  onClick,
}: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "feature-card cursor-pointer group",
        borderColor,
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
          iconBgColor
        )}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
