import { useState, useEffect } from "react";
import { Monitor, Clock, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Session {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  last_used_at: string;
  expires_at: string;
  created_at: string;
}

interface UserSessionsTabProps {
  userId: string;
  fetchSessions: (userId: string) => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function UserSessionsTab({ userId, fetchSessions, revokeSession }: UserSessionsTabProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSessions(userId).then((data) => { setSessions(data); setLoading(false); });
  }, [userId, fetchSessions]);

  const handleRevoke = async (id: string) => {
    const ok = await revokeSession(id);
    if (ok) setSessions((s) => s.filter((x) => x.id !== id));
  };

  const isExpired = (d: string) => new Date(d) < new Date();

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Monitor className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No active sessions</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Badge variant="outline" className="text-xs">{sessions.length} session(s)</Badge>
      {sessions.map((s) => (
        <Card key={s.id} className={`p-3 ${isExpired(s.expires_at) ? "opacity-50" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground truncate">{s.device_info || "Unknown device"}</span>
                {isExpired(s.expires_at) && <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {s.ip_address && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.ip_address}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {formatDate(s.last_used_at)}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => handleRevoke(s.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
