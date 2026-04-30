import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, LayoutDashboard, Library, Bot, TrendingUp, Database, Settings, Shield, Info } from "lucide-react";

interface PermissionMatrixProps {
  role: string;
  currentPermissions: string[];
  onSave: (role: string, permissions: string[]) => Promise<boolean>;
  loading?: boolean;
}

const categories = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "border-l-blue-500",
    bgColor: "bg-blue-500/5",
    permissions: [
      { key: "view_dashboard", label: "View Dashboard", desc: "Access the main dashboard" },
      { key: "customize_widgets", label: "Customize Widgets", desc: "Add, remove, and rearrange widgets" },
    ],
  },
  {
    name: "Library",
    icon: Library,
    color: "border-l-emerald-500",
    bgColor: "bg-emerald-500/5",
    permissions: [
      { key: "view_library", label: "View Library", desc: "Browse app library" },
      { key: "manage_apps", label: "Manage Apps", desc: "Add, edit, and remove apps" },
      { key: "manage_categories", label: "Manage Categories", desc: "Create and organize categories" },
    ],
  },
  {
    name: "AI",
    icon: Bot,
    color: "border-l-violet-500",
    bgColor: "bg-violet-500/5",
    permissions: [
      { key: "use_ai_chat", label: "Use AI Chat", desc: "Access AI assistant" },
      { key: "manage_api_keys", label: "Manage API Keys", desc: "Configure AI API keys" },
    ],
  },
  {
    name: "Crypto",
    icon: TrendingUp,
    color: "border-l-amber-500",
    bgColor: "bg-amber-500/5",
    permissions: [
      { key: "view_crypto", label: "View Crypto", desc: "View crypto market data" },
      { key: "manage_portfolio", label: "Manage Portfolio", desc: "Manage crypto holdings" },
      { key: "manage_transactions", label: "Manage Transactions", desc: "Record buy/sell transactions" },
    ],
  },
  {
    name: "Data",
    icon: Database,
    color: "border-l-cyan-500",
    bgColor: "bg-cyan-500/5",
    permissions: [
      { key: "view_data", label: "View Data", desc: "Access data workspace" },
      { key: "manage_connections", label: "Manage Connections", desc: "Configure data sources" },
      { key: "sync_schema", label: "Sync Schema", desc: "Synchronize database schema" },
    ],
  },
  {
    name: "Settings",
    icon: Settings,
    color: "border-l-orange-500",
    bgColor: "bg-orange-500/5",
    permissions: [
      { key: "view_settings", label: "View Settings", desc: "Access settings page" },
      { key: "edit_profile", label: "Edit Profile", desc: "Edit own user profile" },
      { key: "change_theme", label: "Change Theme", desc: "Customize appearance" },
    ],
  },
  {
    name: "Admin",
    icon: Shield,
    color: "border-l-red-500",
    bgColor: "bg-red-500/5",
    permissions: [
      { key: "view_admin", label: "View Admin", desc: "Access admin panel" },
      { key: "manage_users", label: "Manage Users", desc: "View and manage all users" },
      { key: "manage_roles", label: "Manage Roles", desc: "Assign and change user roles" },
      { key: "manage_permissions", label: "Manage Permissions", desc: "Configure role permissions" },
    ],
  },
];

export function PermissionMatrix({ role, currentPermissions, onSave, loading }: PermissionMatrixProps) {
  const [perms, setPerms] = useState<Set<string>>(new Set(currentPermissions));
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPerms(new Set(currentPermissions));
    setHasChanges(false);
  }, [currentPermissions]);

  const toggle = (key: string) => {
    const next = new Set(perms);
    if (next.has(key)) next.delete(key); else next.add(key);
    setPerms(next);
    setHasChanges(true);
  };

  const toggleCategory = (cat: typeof categories[0]) => {
    const allEnabled = cat.permissions.every((p) => perms.has(p.key));
    const next = new Set(perms);
    cat.permissions.forEach((p) => { if (allEnabled) next.delete(p.key); else next.add(p.key); });
    setPerms(next);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(role, Array.from(perms));
    if (ok) setHasChanges(false);
    setSaving(false);
  };

  const allPerms = categories.flatMap((c) => c.permissions);
  const totalEnabled = allPerms.filter((p) => perms.has(p.key)).length;

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {totalEnabled}/{allPerms.length} enabled
            </Badge>
          </div>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>

        <div className="grid gap-3">
          {categories.map((cat) => {
            const enabledCount = cat.permissions.filter((p) => perms.has(p.key)).length;
            const allEnabled = enabledCount === cat.permissions.length;

            return (
              <Card key={cat.name} className={`border-l-4 ${cat.color} ${cat.bgColor} overflow-hidden`}>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4 text-foreground" />
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                      <Badge variant="outline" className="text-[10px] ml-1">
                        {enabledCount}/{cat.permissions.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{allEnabled ? "All" : "Some"}</span>
                      <Switch
                        checked={allEnabled}
                        onCheckedChange={() => toggleCategory(cat)}
                        className="scale-75"
                      />
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    {cat.permissions.map((perm) => (
                      <div
                        key={perm.key}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-background/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{perm.label}</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="text-xs">{perm.desc}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch
                          checked={perms.has(perm.key)}
                          onCheckedChange={() => toggle(perm.key)}
                          className="scale-75"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
