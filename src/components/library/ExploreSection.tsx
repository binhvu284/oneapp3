import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ExploreSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ExploreSection({ title, description, children, className, delay = 0 }: ExploreSectionProps) {
  return (
    <section
      className={cn("space-y-3 animate-fade-in", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
