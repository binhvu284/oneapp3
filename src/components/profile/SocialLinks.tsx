import { Github, Twitter, Linkedin, Globe, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialLinksProps {
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  isLoading?: boolean;
}

export function SocialLinks({
  githubUrl,
  twitterUrl,
  linkedinUrl,
  websiteUrl,
  isLoading,
}: SocialLinksProps) {
  const navigate = useNavigate();

  const socialItems = [
    { icon: Github, label: "GitHub", url: githubUrl },
    { icon: Twitter, label: "Twitter", url: twitterUrl },
    { icon: Linkedin, label: "LinkedIn", url: linkedinUrl },
    { icon: Globe, label: "Website", url: websiteUrl },
  ];

  const hasSocialLinks = socialItems.some((item) => item.url);

  if (isLoading) {
    return (
      <div className="p-5 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-12 h-12 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-card border border-border rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Social Media</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings/profile")}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {hasSocialLinks ? (
        <div className="flex flex-wrap gap-3">
          {socialItems.map(
            (item) =>
              item.url && (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 bg-muted/50 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                  title={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              )
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No social links added yet.{" "}
          <button
            onClick={() => navigate("/settings/profile")}
            className="text-primary hover:underline"
          >
            Add now
          </button>
        </p>
      )}
    </div>
  );
}
