import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashSync, compareSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

// JWT configuration
const JWT_EXPIRES_IN_DAYS = 7;

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

interface AuthRequest {
  action: "signup" | "signin" | "validate" | "signout" | "sync-signup";
  email?: string;
  password?: string;
  display_name?: string;
  token?: string;
  supabase_url: string;
  supabase_service_key: string;
}

interface PortableUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  created_at: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AuthRequest = await req.json();
    const { action, email, password, display_name, token, supabase_url, supabase_service_key } = body;

    console.log(`[custom-auth] Action: ${action}`);

    // Validate required fields
    if (!supabase_url || !supabase_service_key) {
      return new Response(
        JSON.stringify({ error: "Missing supabase_url or supabase_service_key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create external Supabase client with service key
    const externalClient = createClient(supabase_url, supabase_service_key, {
      auth: { persistSession: false }
    });

    const jwtKey = await getJwtKey();

    switch (action) {
      case "signup": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if email already exists
        const { data: existingUser, error: checkError } = await externalClient
          .from("users")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (checkError) {
          console.error("[custom-auth] Error checking existing user:", checkError);
          return new Response(
            JSON.stringify({ error: "Failed to check existing user", details: checkError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: "An account with this email already exists" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Hash password with bcrypt (using sync version to avoid Worker issues)
        console.log("[custom-auth] Hashing password...");
        const passwordHash = hashSync(password);
        console.log("[custom-auth] Password hashed successfully");

        // Insert new user
        const { data: newUser, error: insertError } = await externalClient
          .from("users")
          .insert({
            email: email.toLowerCase().trim(),
            password_hash: passwordHash,
            display_name: display_name || null,
            email_verified: false,
          })
          .select("id, email, display_name, avatar_url, email_verified, created_at")
          .single();

        if (insertError) {
          console.error("[custom-auth] Error creating user:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create user", details: insertError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate JWT token
        const jwtToken = await create(
          { alg: "HS256", typ: "JWT" },
          {
            sub: newUser.id,
            email: newUser.email,
            exp: getNumericDate(60 * 60 * 24 * JWT_EXPIRES_IN_DAYS), // 7 days
            iat: getNumericDate(0),
          },
          jwtKey
        );

        console.log(`[custom-auth] User created successfully: ${newUser.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            user: newUser as PortableUser,
            token: jwtToken,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "signin": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find user by email
        const { data: user, error: findError } = await externalClient
          .from("users")
          .select("id, email, password_hash, display_name, avatar_url, email_verified, created_at")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (findError) {
          console.error("[custom-auth] Error finding user:", findError);
          return new Response(
            JSON.stringify({ error: "Failed to find user" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!user) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify password using sync version
        console.log("[custom-auth] Verifying password...");
        const passwordValid = compareSync(password, user.password_hash);
        console.log("[custom-auth] Password verification complete");
        
        if (!passwordValid) {
          return new Response(
            JSON.stringify({ error: "Invalid email or password" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update last_sign_in_at
        await externalClient
          .from("users")
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq("id", user.id);

        // Generate JWT token
        const jwtToken = await create(
          { alg: "HS256", typ: "JWT" },
          {
            sub: user.id,
            email: user.email,
            exp: getNumericDate(60 * 60 * 24 * JWT_EXPIRES_IN_DAYS),
            iat: getNumericDate(0),
          },
          jwtKey
        );

        // Remove password_hash from response
        const { password_hash: _, ...safeUser } = user;

        console.log(`[custom-auth] User signed in: ${user.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            user: safeUser as PortableUser,
            token: jwtToken,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "validate": {
        if (!token) {
          return new Response(
            JSON.stringify({ valid: false, error: "No token provided" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          // Verify JWT token
          const payload = await verify(token, jwtKey);
          const userId = payload.sub as string;

          // Fetch fresh user data
          const { data: user, error: fetchError } = await externalClient
            .from("users")
            .select("id, email, display_name, avatar_url, email_verified, created_at")
            .eq("id", userId)
            .maybeSingle();

          if (fetchError || !user) {
            return new Response(
              JSON.stringify({ valid: false, error: "User not found" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.log(`[custom-auth] Token validated for: ${user.email}`);

          return new Response(
            JSON.stringify({
              valid: true,
              user: user as PortableUser,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.error("[custom-auth] Token validation failed:", err);
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid or expired token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      case "signout": {
        // Client-side logout - just return success
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync-signup": {
        // Sync signup: Create user in external database (called after Lovable signup)
        console.log("[custom-auth] sync-signup action called");
        console.log("[custom-auth] sync-signup params:", {
          hasEmail: !!email,
          hasPassword: !!password,
          hasDisplayName: !!display_name,
          hasSupabaseUrl: !!supabase_url,
          hasServiceKey: !!supabase_service_key,
        });
        
        if (!email || !password) {
          console.error("[custom-auth] sync-signup missing email or password");
          return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[custom-auth] Syncing user to external database: ${email.substring(0, 3)}***`);

        // Check if user already exists in external database
        const { data: existingUser, error: checkError } = await externalClient
          .from("users")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (checkError) {
          console.error("[custom-auth] Error checking existing user:", checkError);
          return new Response(
            JSON.stringify({ error: "Failed to check existing user", details: checkError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (existingUser) {
          // User already exists - just return success (sync complete)
          console.log(`[custom-auth] User already exists in external: ${email}`);
          return new Response(
            JSON.stringify({ success: true, synced: true, alreadyExists: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create user in external database using sync hash
        console.log("[custom-auth] Hashing password for sync...");
        const passwordHash = hashSync(password);
        console.log("[custom-auth] Password hashed successfully for sync");
        
        const { data: newUser, error: insertError } = await externalClient
          .from("users")
          .insert({
            email: email.toLowerCase().trim(),
            password_hash: passwordHash,
            display_name: display_name || null,
            email_verified: true, // Already verified via Lovable
          })
          .select("id, email, display_name")
          .single();

        if (insertError) {
          console.error("[custom-auth] Error syncing user:", insertError);
          console.error("[custom-auth] Insert error details:", JSON.stringify(insertError));
          return new Response(
            JSON.stringify({ success: false, error: insertError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[custom-auth] User synced successfully to external database`);
        console.log(`[custom-auth] Synced user ID: ${newUser.id}, email: ${newUser.email}`);

        // Also try to create profile in external database (if profiles table exists)
        try {
          console.log("[custom-auth] Attempting to create profile in external database...");
          
          // Check if profiles table exists
          const { error: profileCheckError } = await externalClient
            .from("profiles")
            .select("id")
            .limit(1);

          if (!profileCheckError) {
            // profiles table exists, create profile
            const { error: profileInsertError } = await externalClient
              .from("profiles")
              .insert({
                id: newUser.id,
                display_name: display_name || null,
              });

            if (profileInsertError) {
              console.warn("[custom-auth] Failed to create profile (non-fatal):", profileInsertError.message);
            } else {
              console.log("[custom-auth] Profile created in external database");
            }
          } else {
            console.log("[custom-auth] profiles table not found in external, skipping profile creation");
          }
        } catch (profileError) {
          console.warn("[custom-auth] Profile creation error (non-fatal):", profileError);
        }

        return new Response(
          JSON.stringify({ success: true, synced: true, user: newUser }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("[custom-auth] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
