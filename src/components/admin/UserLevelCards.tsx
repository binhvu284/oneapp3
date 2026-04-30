import { Crown, Code, Handshake, User, Shield, Key, Mail, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserLevelCardsProps {
  counts: Record<number, number>;
  loading: boolean;
  onSelect: (level: number) => void;
}

const levels = [
  {
    level: 1,
    title: "General Admin",
    icon: Crown,
    gradient: "from-violet-500/20 to-blue-500/20",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-400",
    badgeColor: "bg-violet-500/20 text-violet-300",
    description: "Full system access. Manage all users, roles, permissions, and system settings.",
    tags: [
      { icon: Shield, label: "Full Access" },
      { icon: Lock, label: "System Admin" },
    ],
    disabled: false,
  },
  {
    level: 2,
    title: "Developer",
    icon: Code,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/20 text-blue-300",
    description: "Access to development tools, data workspace, and API management. Created by admins.",
    tags: [
      { icon: Code, label: "Dev Tools" },
      { icon: Shield, label: "Managed Permissions" },
    ],
    disabled: false,
  },
  {
    level: 3,
    title: "Partner",
    icon: Handshake,
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    badgeColor: "bg-amber-500/20 text-amber-300",
    description: "Business partners registered via partner key system. Email verification required.",
    tags: [
      { icon: Key, label: "Partner Keys" },
      { icon: Mail, label: "Email Verify" },
    ],
    disabled: false,
  },
  {
    level: 4,
    title: "Customer",
    icon: User,
    gradient: "from-gray-500/20 to-slate-500/20",
    borderColor: "border-gray-500/30",
    iconColor: "text-gray-400",
    badgeColor: "bg-gray-500/20 text-gray-400",
    description: "End users of the platform. Basic access to dashboard and library features.",
    tags: [],
    disabled: true,
  },
];

export function UserLevelCards({ counts, loading, onSelect }: UserLevelCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {levels.map((lvl) => (
        <Card
          key={lvl.level}
          onClick={() => !lvl.disabled && onSelect(lvl.level)}
          className={`relative overflow-hidden bg-gradient-to-br ${lvl.gradient} border ${lvl.borderColor} p-5 transition-all duration-300 ${
            lvl.disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5"
          }`}
        >
          {lvl.disabled && (
            <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground text-[10px]">Coming Soon</Badge>
          )}

          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center ${lvl.iconColor}`}>
              <lvl.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">{lvl.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">Level {lvl.level}</span>
                <span className="text-muted-foreground">·</span>
                {loading ? (
                  <Skeleton className="h-3 w-8" />
                ) : (
                  <span className={`text-xs font-medium ${lvl.iconColor}`}>{counts[lvl.level] || 0} users</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{lvl.description}</p>

          {lvl.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lvl.tags.map((tag) => (
                <Badge key={tag.label} variant="outline" className={`text-[10px] gap-1 ${lvl.badgeColor} border-transparent`}>
                  <tag.icon className="w-2.5 h-2.5" />
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
