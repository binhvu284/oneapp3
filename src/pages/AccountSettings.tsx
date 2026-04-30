import { useState } from "react";
import { useAuthSource as useAuth } from "@/hooks/useAuthSource";
import { useDataSourceProfile } from "@/hooks/useDataSourceProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, Lock, Loader2 } from "lucide-react";

export default function AccountSettings() {
  const { user } = useAuth();
  const { profile, updateProfile } = useDataSourceProfile();

  const [phone, setPhone] = useState(profile?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePhone = async () => {
    setIsUpdatingPhone(true);
    try {
      await updateProfile({ phone });
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // 1. Verify current password by signing in
      if (!user?.email) throw new Error("User email not found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error("Incorrect current password");

      // 2. If valid, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackNavigation to="/settings" label="Settings" />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account credentials and contact information
        </p>
      </div>

      {/* Email Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Email Address</CardTitle>
          </div>
          <CardDescription>
            Your email is used for login and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phone Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Phone Number</CardTitle>
          </div>
          <CardDescription>
            Add a phone number for account recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+84 xxx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdatePhone} disabled={isUpdatingPhone}>
              {isUpdatingPhone && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Phone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isUpdatingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
