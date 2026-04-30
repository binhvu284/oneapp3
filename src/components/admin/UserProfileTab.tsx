import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Github, Twitter, Linkedin, Globe, Mail, Phone, Calendar, Clock, ShieldCheck } from "lucide-react";
import type { OneAppUser } from "@/hooks/useAdminUsers";

interface UserProfileTabProps {
  user: OneAppUser;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const socialLinks = [
  { key: "github_url", icon: Github, label: "GitHub" },
  { key: "twitter_url", icon: Twitter, label: "Twitter" },
  { key: "linkedin_url", icon: Linkedin, label: "LinkedIn" },
  { key: "website_url", icon: Globe, label: "Website" },
] as const;

export function UserProfileTab({ user }: UserProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xl bg-primary/20 text-primary">
            {(user.display_name || user.name || user.email).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{user.display_name || user.name}</h3>
          {user.nickname && <p className="text-sm text-muted-foreground">@{user.nickname}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={user.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className={user.email_verified ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}>
              {user.email_verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</h4>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{user.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</h4>
          <p className="text-sm text-foreground leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Social Links */}
      {socialLinks.some((s) => user[s.key]) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Links</h4>
          <div className="grid grid-cols-2 gap-2">
            {socialLinks.map((s) => {
              const val = user[s.key];
              if (!val) return null;
              return (
                <a key={s.key} href={val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Info</h4>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="text-foreground">{formatDate(user.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last login:</span>
            <span className="text-foreground">{formatDate(user.last_login_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Roles:</span>
            <div className="flex gap-1">
              {user.roles.length > 0
                ? user.roles.map((r) => <Badge key={r.id} variant="outline" className="text-[10px]">{r.role}</Badge>)
                : <span className="text-foreground">No roles</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
