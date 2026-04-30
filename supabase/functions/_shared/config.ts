/**
 * Shared configuration helpers for OneApp edge functions.
 */

/**
 * Returns the JWT secret. Logs a security warning if relying on the
 * insecure built-in fallback so operators know to set JWT_SECRET.
 */
export function getJwtSecret(): string {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) {
    console.error(
      "[SECURITY] JWT_SECRET env var is not set. " +
      "Using insecure default — set JWT_SECRET in Supabase project secrets before going to production."
    );
    return "oneapp-custom-auth-secret-key-2025";
  }
  return secret;
}

/**
 * Returns CORS headers. Set ALLOWED_ORIGIN env var to your production
 * domain (e.g. "https://app.yourdomain.com") to restrict access.
 * Falls back to "*" when the variable is absent (development-safe).
 */
export function getCorsHeaders(req?: Request): Record<string, string> {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");

  let origin: string;
  if (!allowedOrigin) {
    origin = "*";
  } else if (req) {
    const requestOrigin = req.headers.get("Origin") ?? "";
    origin = requestOrigin === allowedOrigin ? requestOrigin : "null";
  } else {
    origin = allowedOrigin;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
