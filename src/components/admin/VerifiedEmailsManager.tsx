import { useState, useEffect } from "react";
import { Plus, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VerifiedEmail {
  id: string;
  email: string;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
}

interface VerifiedEmailsManagerProps {
  fetchVerifiedEmails: () => Promise<VerifiedEmail[]>;
  addVerifiedEmail: (email: string, expires_at?: string) => Promise<any>;
  deleteVerifiedEmail: (emailId: string) => Promise<boolean>;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function VerifiedEmailsManager({ fetchVerifiedEmails, addVerifiedEmail, deleteVerifiedEmail }: VerifiedEmailsManagerProps) {
  const [emails, setEmails] = useState<VerifiedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await fetchVerifiedEmails();
    setEmails(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const result = await addVerifiedEmail(newEmail);
    if (result) { setShowAdd(false); setNewEmail(""); load(); }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteVerifiedEmail(id);
    if (ok) load();
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{emails.length} emails</Badge>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Email
        </Button>
      </div>

      {emails.length === 0 ? (
        <Card className="p-8 text-center">
          <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No verified emails added yet</p>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Expires</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-xs w-[60px]">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{e.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${e.is_used ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                      {e.is_used ? "Used" : "Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(e.expires_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(e.created_at)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(e.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Verified Email</DialogTitle></DialogHeader>
          <Input type="email" placeholder="Email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newEmail}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
