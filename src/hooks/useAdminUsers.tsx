import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;

async function adminFetch(action: string, params?: Record<string, string>, method = "GET", body?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = new URL(FUNC_URL);
  url.searchParams.set("action", action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export interface OneAppUser {
  id: string;
  email: string;
  name: string;           // Required field - always has data
  display_name: string | null; // Optional override
  nickname: string | null;
  avatar_url: string | null;
  level: number;
  email_verified: boolean;
  is_active: boolean;
  phone: string | null;
  bio: string | null;
  github_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  must_change_password: boolean;
  roles: { id: string; role: string; assigned_at: string }[];
}

export interface RolePermission {
  id: string;
  role: string;
  permission: string;
  description: string | null;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<OneAppUser[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await adminFetch("counts");
      setCounts(data);
    } catch (e: any) {
      console.error("fetchCounts error:", e);
    }
  }, []);

  const fetchUsers = useCallback(async (level: number, search = "") => {
    setLoading(true);
    try {
      const data = await adminFetch("list", { level: String(level), search });
      setUsers(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await adminFetch("delete-user", {}, "POST", { userId });
      toast.success("User deleted successfully");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  }, []);

  const fetchPermissions = useCallback(async (role?: string) => {
    try {
      const data = await adminFetch("permissions", role ? { role } : {});
      setPermissions(data);
      return data;
    } catch (e: any) {
      toast.error(e.message);
      return [];
    }
  }, []);

  const updatePermissions = useCallback(async (role: string, perms: string[]) => {
    try {
      await adminFetch("update-permissions", {}, "POST", { role, permissions: perms });
      toast.success("Permissions updated");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  }, []);

  const fetchSessions = useCallback(async (userId: string) => {
    try {
      return await adminFetch("sessions", { userId });
    } catch (e: any) {
      toast.error(e.message);
      return [];
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      await adminFetch("revoke-session", {}, "POST", { sessionId });
      toast.success("Session revoked");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  }, []);

  // Partner keys
  const fetchPartnerKeys = useCallback(async () => {
    try {
      return await adminFetch("list-partner-keys", {}, "POST", {});
    } catch (e: any) {
      toast.error(e.message);
      return [];
    }
  }, []);

  const createPartnerKey = useCallback(async (data: { key_code: string; description?: string; max_uses?: number; expires_at?: string }) => {
    try {
      const result = await adminFetch("create-partner-key", {}, "POST", data);
      toast.success("Partner key created");
      return result;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, []);

  const togglePartnerKey = useCallback(async (keyId: string, is_active: boolean) => {
    try {
      await adminFetch("toggle-partner-key", {}, "POST", { keyId, is_active });
      toast.success(is_active ? "Key activated" : "Key deactivated");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  }, []);

  // Verified emails
  const fetchVerifiedEmails = useCallback(async () => {
    try {
      return await adminFetch("list-verified-emails", {}, "POST", {});
    } catch (e: any) {
      toast.error(e.message);
      return [];
    }
  }, []);

  const addVerifiedEmail = useCallback(async (email: string, expires_at?: string) => {
    try {
      const result = await adminFetch("add-verified-email", {}, "POST", { email, expires_at });
      toast.success("Email added");
      return result;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    }
  }, []);

  const deleteVerifiedEmail = useCallback(async (emailId: string) => {
    try {
      await adminFetch("delete-verified-email", {}, "POST", { emailId });
      toast.success("Email deleted");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    }
  }, []);

  return {
    users, counts, loading, permissions,
    fetchCounts, fetchUsers, deleteUser,
    fetchPermissions, updatePermissions,
    fetchSessions, revokeSession,
    fetchPartnerKeys, createPartnerKey, togglePartnerKey,
    fetchVerifiedEmails, addVerifiedEmail, deleteVerifiedEmail,
  };
}
