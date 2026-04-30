import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, User, Shield, Monitor, X } from "lucide-react";
import { UserProfileTab } from "./UserProfileTab";
import { UserPermissionsTab } from "./UserPermissionsTab";
import { UserSessionsTab } from "./UserSessionsTab";
import type { OneAppUser, RolePermission } from "@/hooks/useAdminUsers";

interface UserDetailDialogProps {
  user: OneAppUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchPermissions: (role?: string) => Promise<RolePermission[]>;
  updatePermissions: (role: string, perms: string[]) => Promise<boolean>;
  fetchSessions: (userId: string) => Promise<any[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
}

export function UserDetailDialog({
  user, open, onOpenChange,
  fetchPermissions, updatePermissions,
  fetchSessions, revokeSession,
}: UserDetailDialogProps) {
  const [fullscreen, setFullscreen] = useState(true);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 gap-0 overflow-hidden transition-all duration-300 ${
          fullscreen
            ? "max-w-[100vw] w-[100vw] max-h-[100vh] h-[100vh] rounded-none"
            : "max-w-2xl w-full max-h-[85vh]"
        }`}
      >
        <DialogTitle className="sr-only">User Detail</DialogTitle>

        {/* Content */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: fullscreen ? "100vh" : "85vh" }}>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-1.5 gap-0">
              <TabsTrigger value="profile" className="gap-1.5 text-xs data-[state=active]:bg-muted">
                <User className="w-3.5 h-3.5" /> Profile
              </TabsTrigger>
              <TabsTrigger value="permissions" className="gap-1.5 text-xs data-[state=active]:bg-muted">
                <Shield className="w-3.5 h-3.5" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1.5 text-xs data-[state=active]:bg-muted">
                <Monitor className="w-3.5 h-3.5" /> Sessions
              </TabsTrigger>
              <div className="ml-auto flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setFullscreen(!fullscreen)}
                >
                  {fullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </TabsList>

            <div className="p-5">
              <TabsContent value="profile" className="mt-0">
                <UserProfileTab user={user} />
              </TabsContent>
              <TabsContent value="permissions" className="mt-0">
                <UserPermissionsTab
                  user={user}
                  fetchPermissions={fetchPermissions}
                  updatePermissions={updatePermissions}
                />
              </TabsContent>
              <TabsContent value="sessions" className="mt-0">
                <UserSessionsTab
                  userId={user.id}
                  fetchSessions={fetchSessions}
                  revokeSession={revokeSession}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
