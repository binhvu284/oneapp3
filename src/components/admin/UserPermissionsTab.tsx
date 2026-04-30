import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { PermissionMatrix } from "./PermissionMatrix";
import type { OneAppUser, RolePermission } from "@/hooks/useAdminUsers";

interface UserPermissionsTabProps {
  user: OneAppUser;
  fetchPermissions: (role?: string) => Promise<RolePermission[]>;
  updatePermissions: (role: string, perms: string[]) => Promise<boolean>;
}

const roleLabels: Record<string, { label: string; cls: string }> = {
  admin: { label: "Admin", cls: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  developer: { label: "Developer", cls: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  business_partner: { label: "Partner", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  customer: { label: "Customer", cls: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

function getRoleFromLevel(level: number): string {
  const map: Record<number, string> = { 1: "admin", 2: "developer", 3: "business_partner", 4: "customer" };
  return map[level] || "customer";
}

export function UserPermissionsTab({ user, fetchPermissions, updatePermissions }: UserPermissionsTabProps) {
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const role = user.roles[0]?.role || getRoleFromLevel(user.level);

  useEffect(() => {
    setLoading(true);
    fetchPermissions(role).then((data) => {
      setPerms(data.map((p) => p.permission));
      setLoading(false);
    });
  }, [role, fetchPermissions]);

  const rl = roleLabels[role] || roleLabels.customer;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current Role:</span>
        <Badge variant="outline" className={rl.cls}>{rl.label}</Badge>
      </div>

      <PermissionMatrix
        role={role}
        currentPermissions={perms}
        onSave={updatePermissions}
        loading={loading}
      />
    </div>
  );
}
