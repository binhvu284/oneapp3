import { useState } from "react";
import { Copy, Link, Trash2, ExternalLink, Clock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNoteShares } from "@/hooks/useNoteShares";

interface ShareNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  noteTitle: string;
}

const EXPIRY_OPTIONS = [
  { label: "Never expires", value: "never" },
  { label: "1 day", value: "1d" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
];

function expiryToDate(value: string): string | null {
  if (value === "never") return null;
  const now = new Date();
  const days = parseInt(value);
  now.setDate(now.getDate() + days);
  return now.toISOString();
}

export function ShareNoteDialog({ open, onOpenChange, noteId, noteTitle }: ShareNoteDialogProps) {
  const { shares, isLoading, createShare, revokeShare, getShareUrl } = useNoteShares(noteId);
  const [expiry, setExpiry] = useState("never");
  const [creating, setCreating] = useState(false);

  const activeShares = shares.filter(s => s.is_active);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const share = await createShare({ note_id: noteId, expires_at: expiryToDate(expiry) });
      const url = getShareUrl(share.share_token);
      navigator.clipboard.writeText(url);
      toast({ title: "Share link created", description: "Link copied to clipboard" });
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(getShareUrl(token));
    toast({ title: "Link copied" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Share Note
          </DialogTitle>
          <DialogDescription>
            Share "{noteTitle}" with anyone via a public link — no account required to view.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new link */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
            <h4 className="text-sm font-medium text-foreground">Create share link</h4>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Expires
              </Label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full gap-2 h-9">
              <Link className="w-4 h-4" />
              {creating ? "Creating..." : "Create & Copy Link"}
            </Button>
          </div>

          {/* Active shares */}
          {!isLoading && activeShares.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Active links ({activeShares.length})</h4>
              {activeShares.map(share => (
                <div key={share.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-card text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {getShareUrl(share.share_token)}
                    </p>
                    {share.expires_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Expires {new Date(share.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopy(share.share_token)}
                      title="Copy link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(getShareUrl(share.share_token), "_blank")}
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => revokeShare(share.id)}
                      title="Revoke link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
