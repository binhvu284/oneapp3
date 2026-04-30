import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashSync, compareSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

// JWT configuration
const JWT_EXPIRES_IN_DAYS = 7;

// Role level mapping (lower = higher privilege)
const ROLE_LEVELS: Record<string, number> = {
  admin: 1,
  developer: 2,
  business_partner: 3,
  customer: 4,
};

// Create crypto key for JWT signing
async function getJwtKey() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(getJwtSecret());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Hash token for session storage
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

interface AuthRequest {
  action: "signup" | "signin" | "validate" | "signout" | "refresh" | "get-user-roles" | "update-profile" | "reset-password" | "verify-partner-key" | "verify-partner-email";
  email?: string;
  password?: string;
  display_name?: string;
  name?: string;
  token?: string;
  user_id?: string;
  partner_key?: string;
  profile_data?: {
    display_name?: string;
    nickname?: string;
    phone?: string;
    avatar_url?: string;
    github_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    website_url?: string;
    bio?: string;
  };
  device_info?: string;
  // For external datasource mode
  datasource?: "external";
  external_url?: string;
  external_service_key?: string;
}

interface OneAppUser {
  id: string;
  email: string;
  name: string;
  display_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  phone: string | null;
  level: number;
  email_verified: boolean;
  is_active: boolean;
  github_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  bio: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface JWTPayload {
  sub: string; // user_id
  email: string;
  level: number;
  roles: string[];
  exp: number;
  iat: number;
  [key: string]: unknown; // Index signature for JWT Payload compatibility
}

// Helper: get the "best" display name for a user
// Priority: display_name -> name -> email prefix
function getEffectiveName(user: { name?: string; display_name?: string | null; email: string }): string {
  return user.display_name || user.name || user.email.split("@")[0];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AuthRequest = await req.json();
    const {
      action, email, password, display_name, name, token, user_id,
      profile_data, device_info, datasource, external_url, external_service_key
    } = body;

    console.log(`[oneapp-auth] Action: ${action}, Datasource: ${datasource || 'primary'}`);

    // Determine which Supabase client to use
    let supabaseUrl: string;
    let supabaseKey: string;

    if (datasource === "external" && external_url && external_service_key) {
      supabaseUrl = external_url;
      supabaseKey = external_service_key;
      console.log("[oneapp-auth] Using external datasource");
    } else {
      supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      console.log("[oneapp-auth] Using primary datasource");
    }

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing datasource configuration" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const jwtKey = await getJwtKey();

    switch (action) {
      // ========================================
      // SIGNUP - Create new user in oneapp_users
      // ========================================
      case "signup": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
          .from("oneapp_users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (checkError) {
          console.error("[oneapp-auth] Error checking existing user:", checkError);
          return new Response(
            JSON.stringify({ error: "Failed to check existing user", details: checkError.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: "An account with this email already exists" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate password strength
        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash password with bcrypt
        console.log("[oneapp-auth] Hashing password...");
        const passwordHash = hashSync(password);
        console.log("[oneapp-auth] Password hashed successfully");

        // Determine name: use provided name/display_name, then fallback to email prefix
        const effectiveName = name || display_name || normalizedEmail.split("@")[0];

        // Insert new user with default level (customer = 4)
        const { data: newUser, error: insertError } = await supabase
          .from("oneapp_users")
          .insert({
            email: normalizedEmail,
            name: effectiveName,
            password_hash: passwordHash,
            display_name: display_name || null,
            level: ROLE_LEVELS.customer,
            email_verified: true, // Auto-confirm for now
            is_active: true,
          })
          .select("*")
          .single();

        if (insertError) {
          console.error("[oneapp-auth] Error creating user:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create user", details: insertError.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Assign default role (customer)
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: newUser.id,
            role: "customer",
          });

        if (roleError) {
          console.error("[oneapp-auth] Error assigning default role:", roleError);
          // Non-fatal, continue
        }

        // Fetch user roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", newUser.id);

        const userRoles = roles?.map(r => r.role) || ["customer"];

        // Generate JWT token
        const jwtPayload: JWTPayload = {
          sub: newUser.id,
          email: newUser.email,
          level: newUser.level,
          roles: userRoles,
          exp: getNumericDate(60 * 60 * 24 * JWT_EXPIRES_IN_DAYS),
          iat: getNumericDate(0),
        };

        const jwtToken = await create(
          { alg: "HS256", typ: "JWT" },
          jwtPayload,
          jwtKey
        );

        // Create session
        const tokenHash = await hashToken(jwtToken);
        const expiresAt = new Date(Date.now() + JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

        await supabase
          .from("user_sessions")
          .insert({
            user_id: newUser.id,
            token_hash: tokenHash,
            device_info: device_info || null,
            expires_at: expiresAt.toISOString(),
          });

        // Remove password_hash from response
        const { password_hash: _, ...safeUser } = newUser;

        console.log(`[oneapp-auth] User created successfully: ${newUser.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            user: { ...safeUser, roles: userRoles } as OneAppUser & { roles: string[] },
            token: jwtToken,
            expires_at: expiresAt.toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================
      // SIGNIN - Authenticate existing user
      // ========================================
      case "signin": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const { data: user, error: findError } = await supabase
          .from("oneapp_users")
          .select("*")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (findError) {
          console.error("[oneapp-auth] Error finding user:", findError);
          return new Response(
            JSON.stringify({ error: "Failed to find user" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!user) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!user.is_active) {
          return new Response(
            JSON.stringify({ error: "Account is deactivated" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let passwordValid = false;
        try {
          console.log("[oneapp-auth] Verifying password...");
          passwordValid = compareSync(password, user.password_hash);
          console.log("[oneapp-auth] Password verification complete");
        } catch (pwErr) {
          console.error("[oneapp-auth] Password comparison error:", pwErr);
        }

        if (!passwordValid) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update last_login_at
        await supabase
          .from("oneapp_users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);

        // Fetch user roles
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const userRoles = roles?.map(r => r.role) || [];

        // Generate JWT token
        const jwtPayload: JWTPayload = {
          sub: user.id,
          email: user.email,
          level: user.level,
          roles: userRoles,
          exp: getNumericDate(60 * 60 * 24 * JWT_EXPIRES_IN_DAYS),
          iat: getNumericDate(0),
        };

        const jwtToken = await create(
          { alg: "HS256", typ: "JWT" },
          jwtPayload,
          jwtKey
        );

        // Create session
        const tokenHash = await hashToken(jwtToken);
        const expiresAt = new Date(Date.now() + JWT_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

        await supabase
          .from("user_sessions")
          .insert({
            user_id: user.id,
            token_hash: tokenHash,
            device_info: device_info || null,
            expires_at: expiresAt.toISOString(),
          });

        // Remove password_hash from response
        const { password_hash: _, ...safeUser } = user;

        console.log(`[oneapp-auth] User signed in: ${user.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            user: { ...safeUser, roles: userRoles } as OneAppUser & { roles: string[] },
            token: jwtToken,
            expires_at: expiresAt.toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================
      // VALIDATE - Verify JWT and return user
      // With dual-validation fallback: try primary datasource first, then fallback
      // ========================================
      case "validate": {
        if (!token) {
          return new Response(
            JSON.stringify({ valid: false, error: "No token provided" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Helper function to validate session against a specific datasource
        // deno-lint-ignore no-explicit-any
        async function validateAgainstDatasource(client: any, datasourceName: string): Promise<{
          valid: boolean;
          user?: OneAppUser & { roles: string[] };
          source?: string;
          error?: string;
          status?: number;
        } | null> {
          try {
            // Verify JWT token
            const payload = await verify(token!, jwtKey) as JWTPayload;
            const userId = payload.sub;

            // Check session exists and not expired
            const tokenHash = await hashToken(token!);
            const { data: session, error: sessionError } = await client
              .from("user_sessions")
              .select("id, expires_at")
              .eq("user_id", userId)
              .eq("token_hash", tokenHash)
              .maybeSingle();

            if (sessionError || !session) {
              console.log(`[oneapp-auth] Session not found in ${datasourceName}`);
              return null;
            }

            if (new Date(session.expires_at) < new Date()) {
              // Clean up expired session
              await client
                .from("user_sessions")
                .delete()
                .eq("id", session.id);
              console.log(`[oneapp-auth] Session expired in ${datasourceName}`);
              return null;
            }

            // Update last_used_at
            await client
              .from("user_sessions")
              .update({ last_used_at: new Date().toISOString() })
              .eq("id", session.id);

            // Fetch fresh user data
            const { data: user, error: fetchError } = await client
              .from("oneapp_users")
              .select("*")
              .eq("id", userId)
              .maybeSingle();

            if (fetchError || !user) {
              console.log(`[oneapp-auth] User not found in ${datasourceName}`);
              return null;
            }

            if (!user.is_active) {
              return { valid: false, error: "Account is deactivated", status: 200 };
            }

            // Fetch user roles
            const { data: roles } = await client
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id);

            // deno-lint-ignore no-explicit-any
            const userRoles = roles?.map((r: any) => r.role) || [];

            // Remove password_hash from response
            const { password_hash: _, ...safeUser } = user;

            console.log(`[oneapp-auth] Token validated for: ${user.email} (${datasourceName})`);

            return {
              valid: true,
              user: { ...safeUser, roles: userRoles } as OneAppUser & { roles: string[] },
              source: datasourceName,
            };
          } catch (err) {
            console.log(`[oneapp-auth] Validation failed in ${datasourceName}:`, err);
            return null;
          }
        }

        try {
          // Try primary datasource first
          let result = await validateAgainstDatasource(supabase, datasource === "external" ? "external" : "primary");

          // If primary failed and we're using external, fallback to primary Supabase
          if (!result && datasource === "external") {
            console.log("[oneapp-auth] Fallback: trying primary datasource");
            const primaryUrl = Deno.env.get("SUPABASE_URL") || "";
            const primaryKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

            if (primaryUrl && primaryKey) {
              const primaryClient = createClient(primaryUrl, primaryKey, {
                auth: { persistSession: false }
              });
              result = await validateAgainstDatasource(primaryClient, "primary");
            }
          }

          if (result) {
            if (result.error && result.status) {
              return new Response(
                JSON.stringify({ valid: false, error: result.error }),
                { status: result.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify(result),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // All datasources failed
          return new Response(
            JSON.stringify({ valid: false, error: "Session expired" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.error("[oneapp-auth] Token validation failed:", err);
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid or expired token" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // ========================================
      // SIGNOUT - Invalidate session
      // ========================================
      case "signout": {
        if (token) {
          try {
            const payload = await verify(token, jwtKey) as JWTPayload;
            const tokenHash = await hashToken(token);

            // Delete session
            await supabase
              .from("user_sessions")
              .delete()
              .eq("user_id", payload.sub)
              .eq("token_hash", tokenHash);

            console.log(`[oneapp-auth] Session deleted for user: ${payload.sub}`);
          } catch (err) {
            // Token might be invalid, but we still want to return success
            console.log("[oneapp-auth] Token invalid on signout, ignoring");
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================
      // GET-USER-ROLES - Get user roles and permissions
      // ========================================
      case "get-user-roles": {
        if (!user_id && !token) {
          return new Response(
            JSON.stringify({ error: "User ID or token required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let targetUserId = user_id;

        if (!targetUserId && token) {
          try {
            const payload = await verify(token, jwtKey) as JWTPayload;
            targetUserId = payload.sub;
          } catch {
            return new Response(
              JSON.stringify({ error: "Invalid token" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Fetch roles
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role, assigned_at")
          .eq("user_id", targetUserId);

        if (rolesError) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch roles" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Fetch permissions for these roles
        const roleNames = roles?.map(r => r.role) || [];
        const { data: permissions } = await supabase
          .from("role_permissions")
          .select("role, permission, description")
          .in("role", roleNames);

        // Get user level
        const { data: user } = await supabase
          .from("oneapp_users")
          .select("level")
          .eq("id", targetUserId)
          .single();

        return new Response(
          JSON.stringify({
            user_id: targetUserId,
            level: user?.level || 4,
            roles: roles || [],
            permissions: permissions || [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================
      // UPDATE-PROFILE - Update user profile data
      // ========================================
      case "update-profile": {
        if (!token) {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let userId: string;
        try {
          const payload = await verify(token, jwtKey) as JWTPayload;
          userId = payload.sub;
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid token" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!profile_data) {
          return new Response(
            JSON.stringify({ error: "Profile data required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update allowed fields only
        const allowedFields = [
          "display_name", "nickname", "phone", "avatar_url",
          "github_url", "twitter_url", "linkedin_url", "website_url", "bio"
        ];

        const updateData: Record<string, unknown> = {};
        for (const field of allowedFields) {
          if (field in profile_data) {
            updateData[field] = profile_data[field as keyof typeof profile_data];
          }
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from("oneapp_users")
          .update(updateData)
          .eq("id", userId)
          .select("*")
          .maybeSingle();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update profile", details: updateError.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!updatedUser) {
          console.log(`[oneapp-auth] User ${userId} not found in current datasource, returning update data`);
          return new Response(
            JSON.stringify({
              success: true,
              user: { id: userId, ...updateData },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { password_hash: _, ...safeUser } = updatedUser;

        console.log(`[oneapp-auth] Profile updated for: ${updatedUser.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            user: safeUser,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================
      // RESET-PASSWORD - Reset user password
      // ========================================
      case "reset-password": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and new password are required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Hash new password
        const newHash = hashSync(password);

        const { data: user, error: findErr } = await supabase
          .from("oneapp_users")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (findErr || !user) {
          return new Response(
            JSON.stringify({ error: "User not found" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateErr } = await supabase
          .from("oneapp_users")
          .update({ password_hash: newHash, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (updateErr) {
          console.error("[oneapp-auth] Error updating password:", updateErr);
          return new Response(
            JSON.stringify({ error: "Failed to reset password" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Invalidate all sessions
        await supabase.from("user_sessions").delete().eq("user_id", user.id);
        console.log(`[oneapp-auth] Password reset for: ${normalizedEmail}`);

        return new Response(
          JSON.stringify({ success: true, message: "Password has been reset successfully." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify-partner-key": {
        const key = body.partner_key?.trim();
        if (!key) {
          return new Response(
            JSON.stringify({ error: "Partner key is required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: partnerKey, error: keyErr } = await supabase
          .from("partner_keys")
          .select("id, key_code, is_active, max_uses, current_uses, expires_at")
          .eq("key_code", key)
          .maybeSingle();

        if (keyErr || !partnerKey) {
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid partner key" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!partnerKey.is_active) {
          return new Response(
            JSON.stringify({ valid: false, error: "This partner key is no longer active" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (partnerKey.expires_at && new Date(partnerKey.expires_at) < new Date()) {
          return new Response(
            JSON.stringify({ valid: false, error: "This partner key has expired" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (partnerKey.max_uses !== null && partnerKey.current_uses >= partnerKey.max_uses) {
          return new Response(
            JSON.stringify({ valid: false, error: "This partner key has reached its maximum usage limit" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[oneapp-auth] Partner key verified: ${key}`);
        return new Response(
          JSON.stringify({ valid: true, partner_key_id: partnerKey.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify-partner-email": {
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const normalizedPartnerEmail = email.toLowerCase().trim();

        const { data: verifiedEmail, error: emailErr } = await supabase
          .from("verified_emails")
          .select("id, email, is_used, expires_at")
          .eq("email", normalizedPartnerEmail)
          .maybeSingle();

        if (emailErr || !verifiedEmail) {
          return new Response(
            JSON.stringify({ valid: false, error: "Email is not in the approved partner list" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (verifiedEmail.is_used) {
          return new Response(
            JSON.stringify({ valid: false, error: "This email has already been used for registration" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (verifiedEmail.expires_at && new Date(verifiedEmail.expires_at) < new Date()) {
          return new Response(
            JSON.stringify({ valid: false, error: "This email verification has expired" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[oneapp-auth] Partner email verified: ${normalizedPartnerEmail}`);
        return new Response(
          JSON.stringify({ valid: true, verified_email_id: verifiedEmail.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("[oneapp-auth] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
