import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import type { OneAppUser } from "@/hooks/useAdminUsers";

interface DeleteUserDialogProps {
  user: OneAppUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string) => Promise<boolean>;
}

export function DeleteUserDialog({ user, open, onOpenChange, onConfirm }: DeleteUserDialogProps) {
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const canDelete = confirm === user.email;

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await onConfirm(user.id);
    setDeleting(false);
    if (ok) { onOpenChange(false); setConfirm(""); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setConfirm(""); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-foreground">
            You are about to permanently delete <strong>{user.display_name || user.email}</strong>. 
            All associated data (roles, sessions) will be removed.
          </p>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Type <strong>{user.email}</strong> to confirm:</p>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={user.email} className="text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!canDelete || deleting}>
            {deleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
