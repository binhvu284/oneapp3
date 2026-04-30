import { useState, useEffect } from "react";
import { Plus, Key, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PartnerKey {
  id: string;
  key_code: string;
  description: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface PartnerKeysManagerProps {
  fetchPartnerKeys: () => Promise<PartnerKey[]>;
  createPartnerKey: (data: { key_code: string; description?: string; max_uses?: number; expires_at?: string }) => Promise<any>;
  togglePartnerKey: (keyId: string, is_active: boolean) => Promise<boolean>;
}

function maskKey(key: string) {
  if (key.length <= 6) return "••••••";
  return key.slice(0, 3) + "•".repeat(Math.min(key.length - 6, 10)) + key.slice(-3);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PartnerKeysManager({ fetchPartnerKeys, createPartnerKey, togglePartnerKey }: PartnerKeysManagerProps) {
  const [keys, setKeys] = useState<PartnerKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ key_code: "", description: "", max_uses: "1" });

  const load = async () => {
    setLoading(true);
    const data = await fetchPartnerKeys();
    setKeys(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const result = await createPartnerKey({
      key_code: form.key_code,
      description: form.description || undefined,
      max_uses: parseInt(form.max_uses) || 1,
    });
    if (result) { setShowCreate(false); setForm({ key_code: "", description: "", max_uses: "1" }); load(); }
  };

  const handleToggle = async (k: PartnerKey) => {
    const ok = await togglePartnerKey(k.id, !k.is_active);
    if (ok) load();
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{keys.length} keys</Badge>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Key
        </Button>
      </div>

      {keys.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No partner keys created yet</p>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Key Code</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Uses</TableHead>
                <TableHead className="text-xs">Expires</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs w-[60px]">Toggle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{maskKey(k.key_code)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{k.description || "—"}</TableCell>
                  <TableCell className="text-xs">{k.current_uses}/{k.max_uses || "∞"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(k.expires_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${k.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                      {k.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggle(k)}>
                      {k.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Partner Key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Key code (e.g. PARTNER-2025-001)" value={form.key_code} onChange={(e) => setForm({ ...form, key_code: e.target.value })} />
            <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input type="number" placeholder="Max uses" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.key_code}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
