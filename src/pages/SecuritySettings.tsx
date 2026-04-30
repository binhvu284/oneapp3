import { useState, useEffect } from "react";
import { useDataSourceProfile } from "@/hooks/useDataSourceProfile";
import { useSecurity } from "@/hooks/useSecurity";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, ShieldCheck, ShieldAlert,
  Smartphone, Monitor, Laptop, Tablet,
  MapPin, Clock, Key, Bell, History,
  Fingerprint, AlertTriangle, Lock,
  Eye, EyeOff, RefreshCw, Trash2,
  LogIn, LogOut, Mail, Globe, Loader2,
  CheckCircle2, XCircle, ChevronRight
} from "lucide-react";
import {
  mockSessions,
  mockLoginHistory,
  mockTrustedDevices,
  mockActivityLog,
  DeviceIcon,
  ActivityIcon
} from "@/components/settings/security/security-utils";

// ─── Component ──────────────────────────────────────────────

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [authAppEnabled, setAuthAppEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { profile, updateProfile } = useDataSourceProfile();
  const {
    loginHistory,
    trustedDevices,
    removeTrustedDevice,
    removeAllDevices,
    revokeSession
  } = useSecurity();

  const [backupEmail, setBackupEmail] = useState("");

  useEffect(() => {
    // We leverage the user profile phone or a future bio field mapping to backup email,
    // assuming backend schema holds `backup_email` (custom).
    // Let's assume it maps to the 'backup_email' column as created in SQL.
    if (profile && 'backup_email' in profile) {
      setBackupEmail((profile as any).backup_email || "");
    }
  }, [profile]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const [alerts, setAlerts] = useState({
    newDevice: true,
    passwordChange: true,
    emailChange: true,
    unknownIp: false,
    failedLogin: true,
    sessionRevoked: false,
  });

  const simulateLoading = (key: string, ms = 1200) => {
    setLoadingStates((s) => ({ ...s, [key]: true }));
    setTimeout(() => setLoadingStates((s) => ({ ...s, [key]: false })), ms);
  };

  const handleUpdateBackupEmail = async () => {
    if (!backupEmail || !backupEmail.includes('@')) return;
    setLoadingStates((s) => ({ ...s, backup: true }));

    // Using updateProfile to save backup_email to profiles/oneapp_users table
    try {
      await updateProfile({ backup_email: backupEmail } as any);
    } finally {
      setLoadingStates((s) => ({ ...s, backup: false }));
    }
  };

  const recoveryCodes = ["A8K2-M4X9", "B3N7-P1Q5", "C6R8-S2T4", "D9U1-V5W3", "E7Y6-Z0F2", "G4H8-J3L1"];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <BackNavigation to="/settings" label="Settings" />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">
          Protect your account with advanced security settings
        </p>
      </div>

      {/* ── 1. Two-Factor Authentication ─────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
            </div>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"} className="text-xs">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authenticator App */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Authenticator App</p>
                <p className="text-xs text-muted-foreground">Use Google Authenticator or similar</p>
              </div>
            </div>
            {authAppEnabled ? (
              <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { simulateLoading("authApp"); setAuthAppEnabled(true); setTwoFactorEnabled(true); }}>
                {loadingStates["authApp"] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set up"}
              </Button>
            )}
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">SMS Verification</p>
                <p className="text-xs text-muted-foreground">Receive codes via text message</p>
              </div>
            </div>
            {smsEnabled ? (
              <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Active</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { simulateLoading("sms"); setSmsEnabled(true); setTwoFactorEnabled(true); }}>
                {loadingStates["sms"] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set up"}
              </Button>
            )}
          </div>

          <Separator />

          {/* Recovery Codes */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Recovery Codes</p>
                <p className="text-xs text-muted-foreground">Use these if you lose access to your 2FA device</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}>
                  {showRecoveryCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span className="ml-1">{showRecoveryCodes ? "Hide" : "View"}</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => simulateLoading("regen")}>
                  {loadingStates["regen"] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span className="ml-1">Regenerate</span>
                </Button>
              </div>
            </div>
            {showRecoveryCodes && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recoveryCodes.map((code) => (
                  <div key={code} className="px-3 py-2 rounded-md bg-muted text-center font-mono text-sm text-foreground border">
                    {code}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Account Recovery ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Account Recovery</CardTitle>
          </div>
          <CardDescription>Update your backup email for recovery options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="backup-email" className="text-sm">Backup Email</Label>
            <div className="flex gap-2">
              <Input id="backup-email" type="email" placeholder="backup@example.com" value={backupEmail} onChange={(e) => setBackupEmail(e.target.value)} className="flex-1" />
              <Button variant="outline" onClick={handleUpdateBackupEmail} disabled={!backupEmail}>
                {loadingStates["backup"] ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Used to recover your account if you lose access</p>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Active Sessions ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </div>
            <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => simulateLoading("revokeAll")}>
              {loadingStates["revokeAll"] ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Revoke All Others
            </Button>
          </div>
          <CardDescription>Manage devices where you're currently signed in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockSessions.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                  <DeviceIcon type={s.icon} className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{s.device}</p>
                    {s.isCurrent && (
                      <Badge variant="default" className="text-[10px] h-5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Current</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{s.ip}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.lastActive}</span>
                  </div>
                </div>
              </div>
              {!s.isCurrent && (
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8 shrink-0" onClick={() => simulateLoading(`revoke-${s.id}`)}>
                  {loadingStates[`revoke-${s.id}`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 4. Login History ─────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Login History</CardTitle>
          </div>
          <CardDescription>Recent sign-in attempts on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loginHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg bg-muted/10">No recent login history found.</p>
            ) : loginHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.status === "success" ? "bg-emerald-500/10" : "bg-destructive/10"
                    }`}>
                    {entry.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.device}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entry.location || 'Unknown'}</span>
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{entry.ip_address || 'Unknown IP'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                  <Badge variant={entry.status === "success" ? "secondary" : "destructive"} className="text-[10px]">
                    {entry.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Trusted Devices ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Trusted Devices</CardTitle>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-8 text-destructive hover:text-destructive" onClick={removeAllDevices}>
              Remove All
            </Button>
          </div>
          <CardDescription>Devices that won't require additional verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {trustedDevices.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg bg-muted/10">No trusted devices found.</p>
          ) : trustedDevices.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DeviceIcon type={d.device_icon || "monitor"} className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{d.device_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(d.created_at).toLocaleDateString()} · Last used {new Date(d.last_used_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-8" onClick={() => removeTrustedDevice(d.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── 6. Security Alerts ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Security Alerts</CardTitle>
          </div>
          <CardDescription>Get notified about important security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { key: "newDevice" as const, label: "Sign-in from new device", desc: "Alert when a new device signs into your account" },
              { key: "passwordChange" as const, label: "Password changes", desc: "Notify when your password is updated" },
              { key: "emailChange" as const, label: "Email address changes", desc: "Alert when your email is modified" },
              { key: "unknownIp" as const, label: "Login from unknown IP", desc: "Warn about sign-ins from unrecognized locations" },
              { key: "failedLogin" as const, label: "Failed login attempts", desc: "Notify about unsuccessful sign-in attempts" },
              { key: "sessionRevoked" as const, label: "Session revoked", desc: "Alert when a session is terminated" },
            ].map((alert, i, arr) => (
              <div key={alert.key}>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{alert.label}</p>
                    <p className="text-xs text-muted-foreground">{alert.desc}</p>
                  </div>
                  <Switch
                    checked={alerts[alert.key]}
                    onCheckedChange={(v) => setAlerts((a) => ({ ...a, [alert.key]: v }))}
                  />
                </div>
                {i < arr.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 7. Account Activity Log ──────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Account Activity</CardTitle>
          </div>
          <CardDescription>Recent security-related events on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {mockActivityLog.map((item) => (
                <div key={item.id} className="flex items-start gap-3 relative">
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center z-10 shrink-0">
                    <ActivityIcon type={item.type} className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{item.time}</span>
                      <span>·</span>
                      <span>{item.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
