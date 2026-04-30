import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "./LevelBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileHeaderProps {
  displayName?: string | null;
  nickname?: string | null;
  email?: string;
  avatarUrl?: string | null;
  isLoading?: boolean;
}

export function ProfileHeader({
  displayName,
  nickname,
  email,
  avatarUrl,
  isLoading,
}: ProfileHeaderProps) {
  const getInitials = (name?: string | null, fallbackEmail?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (fallbackEmail) {
      return fallbackEmail.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border border-border rounded-xl">
        <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
        <div className="flex flex-col items-center md:items-start gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border border-border rounded-xl">
      <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary shadow-lg shadow-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt={displayName || email} />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl font-bold">
          {getInitials(displayName, email)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center md:items-start gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {displayName || "User"}
        </h1>
        {nickname && (
          <span className="text-muted-foreground text-lg">@{nickname}</span>
        )}
        <div className="mt-2">
          <LevelBadge />
        </div>
      </div>
    </div>
  );
}
