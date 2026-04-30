import { useAuthSource as useAuthSafe } from "@/hooks/useAuthSource";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry, stay foolish.",
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
];

export default function WelcomeWidget() {
  const { user } = useAuthSafe();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const name = user?.display_name || user?.name || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  return (
    <div className="flex items-center gap-3 h-full">
      {/* Avatar */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-primary">{name[0]?.toUpperCase()}</span>
        )}
      </div>
      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 gap-0.5">
        <p className="text-[10px] text-muted-foreground">{greeting},</p>
        <h2 className="text-base font-bold text-foreground truncate">{name}</h2>
        <p className="text-[10px] text-muted-foreground/70 italic truncate">"{quote}"</p>
      </div>
    </div>
  );
}
