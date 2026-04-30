import { useState, useEffect, useCallback } from "react";
import { Users, Lock, FlaskConical, ArrowLeft, Key, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingCard } from "@/components/settings/SettingCard";
import { UserLevelCards } from "@/components/admin/UserLevelCards";
import { UserListTable } from "@/components/admin/UserListTable";
import { UserListCards } from "@/components/admin/UserListCards";
import { UserDetailDialog } from "@/components/admin/UserDetailDialog";
import { DeleteUserDialog } from "@/components/admin/DeleteUserDialog";
import { PartnerKeysManager } from "@/components/admin/PartnerKeysManager";
import { VerifiedEmailsManager } from "@/components/admin/VerifiedEmailsManager";
import { useAdminUsers, type OneAppUser } from "@/hooks/useAdminUsers";
import { useIsMobile } from "@/hooks/use-mobile";

type ViewType = "main" | "users" | "security" | "playground";

const levelTitles: Record<number, string> = {
  1: "General Admin",
  2: "Developer",
  3: "Partner",
  4: "Customer",
};

export default function SystemAdmin() {
  const [view, setView] = useState<ViewType>("main");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<OneAppUser | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OneAppUser | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const isMobile = useIsMobile();

  const {
    users, counts, loading,
    fetchCounts, fetchUsers, deleteUser,
    fetchPermissions, updatePermissions,
    fetchSessions, revokeSession,
    fetchPartnerKeys, createPartnerKey, togglePartnerKey,
    fetchVerifiedEmails, addVerifiedEmail, deleteVerifiedEmail,
  } = useAdminUsers();

  useEffect(() => {
    if (view === "users" && !selectedLevel) {
      fetchCounts();
    }
  }, [view, selectedLevel, fetchCounts]);

  useEffect(() => {
    if (selectedLevel) {
      fetchUsers(selectedLevel, searchTerm);
    }
  }, [selectedLevel, fetchUsers]);

  const handleSearch = useCallback((val: string) => {
    setSearchTerm(val);
    if (selectedLevel) fetchUsers(selectedLevel, val);
  }, [selectedLevel, fetchUsers]);

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setSearchTerm("");
  };

  const handleViewUser = (user: OneAppUser) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  const handleDeleteUser = (user: OneAppUser) => {
    setDeleteTarget(user);
    setShowDelete(true);
  };

  const handleConfirmDelete = async (userId: string) => {
    const ok = await deleteUser(userId);
    if (ok && selectedLevel) fetchUsers(selectedLevel, searchTerm);
    return ok;
  };

  const handleBack = () => {
    if (selectedLevel) {
      setSelectedLevel(null);
      setSearchTerm("");
      fetchCounts();
    } else {
      setView("main");
    }
  };

  // OneApp Users view
  if (view === "users") {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {selectedLevel ? `Back to Level Selection` : "Back to System Admin"}
        </Button>

        {!selectedLevel ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">OneApp Users</h1>
              <p className="text-sm text-muted-foreground mt-1">Select a user level to manage</p>
            </div>
            <UserLevelCards counts={counts} loading={loading} onSelect={handleSelectLevel} />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{levelTitles[selectedLevel]} Users</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage {levelTitles[selectedLevel].toLowerCase()} accounts</p>
            </div>

            {/* Partner level has extra tabs */}
            {selectedLevel === 3 ? (
              <Tabs defaultValue="users" className="w-full">
                <TabsList>
                  <TabsTrigger value="users" className="gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5" /> Users
                  </TabsTrigger>
                  <TabsTrigger value="keys" className="gap-1.5 text-xs">
                    <Key className="w-3.5 h-3.5" /> Partner Keys
                  </TabsTrigger>
                  <TabsTrigger value="emails" className="gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Verified Emails
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-4">
                  {isMobile ? (
                    <UserListCards users={users} loading={loading} searchTerm={searchTerm} onSearchChange={handleSearch} onViewUser={handleViewUser} onDeleteUser={handleDeleteUser} />
                  ) : (
                    <UserListTable users={users} loading={loading} searchTerm={searchTerm} onSearchChange={handleSearch} onViewUser={handleViewUser} onDeleteUser={handleDeleteUser} levelTitle={levelTitles[selectedLevel]} />
                  )}
                </TabsContent>
                <TabsContent value="keys" className="mt-4">
                  <PartnerKeysManager fetchPartnerKeys={fetchPartnerKeys} createPartnerKey={createPartnerKey} togglePartnerKey={togglePartnerKey} />
                </TabsContent>
                <TabsContent value="emails" className="mt-4">
                  <VerifiedEmailsManager fetchVerifiedEmails={fetchVerifiedEmails} addVerifiedEmail={addVerifiedEmail} deleteVerifiedEmail={deleteVerifiedEmail} />
                </TabsContent>
              </Tabs>
            ) : (
              <>
                {isMobile ? (
                  <UserListCards users={users} loading={loading} searchTerm={searchTerm} onSearchChange={handleSearch} onViewUser={handleViewUser} onDeleteUser={handleDeleteUser} />
                ) : (
                  <UserListTable users={users} loading={loading} searchTerm={searchTerm} onSearchChange={handleSearch} onViewUser={handleViewUser} onDeleteUser={handleDeleteUser} levelTitle={levelTitles[selectedLevel]} />
                )}
              </>
            )}
          </>
        )}

        <UserDetailDialog
          user={selectedUser}
          open={showDetail}
          onOpenChange={setShowDetail}
          fetchPermissions={fetchPermissions}
          updatePermissions={updatePermissions}
          fetchSessions={fetchSessions}
          revokeSession={revokeSession}
        />

        <DeleteUserDialog
          user={deleteTarget}
          open={showDelete}
          onOpenChange={setShowDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }

  // User Security view
  if (view === "security") {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setView("main")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to System Admin
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Security</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure security settings and monitor events.</p>
        </div>
        <Card className="p-8 bg-card border-border flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Security Configuration</h2>
          <p className="text-muted-foreground text-center max-w-md">Coming soon.</p>
        </Card>
      </div>
    );
  }

  // Admin Playground view
  if (view === "playground") {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setView("main")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to System Admin
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Playground</h1>
          <p className="text-sm text-muted-foreground mt-1">Test and experiment with admin features.</p>
        </div>
        <Card className="p-8 bg-card border-border flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Experimentation Zone</h2>
          <p className="text-muted-foreground text-center max-w-md">Coming soon.</p>
        </Card>
      </div>
    );
  }

  // Main view
  return (
    <div className="w-full space-y-4">
      <SettingCard icon={Users} title="OneApp Users" description="Manage all users in the OneApp system. View user profiles, activity status, and account information." onClick={() => setView("users")} />
      <SettingCard icon={Lock} title="User Security" description="Configure security settings, manage user roles and permissions, and monitor security events." onClick={() => setView("security")} />
      <SettingCard icon={FlaskConical} title="Admin Playground" description="Test and experiment with admin features in a safe environment. Debug and troubleshoot issues." onClick={() => setView("playground")} />
    </div>
  );
}
