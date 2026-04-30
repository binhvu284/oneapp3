import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

import { getCorsHeaders, getJwtSecret } from "../_shared/config.ts";

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

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify OneApp JWT
        let userId: string;
        try {
            const jwtKey = await getJwtKey();
            const payload = await verify(token, jwtKey) as Record<string, unknown>;
            userId = payload.sub as string;
            if (!userId) throw new Error("No user ID in token");
        } catch (err) {
            console.error("JWT verification failed:", err);
            return new Response(
                JSON.stringify({ error: "Invalid or expired session." }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Use service_role to bypass RLS
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        });

        const { data, error } = await supabase
            .from("user_api_keys")
            .select("github_key, gemini_key, chatgpt_key, claude_key, perplexity_key, grok_key, deepseek_key, groq_key, exa_key, github_active_model")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error fetching API keys:", error);
            return new Response(
                JSON.stringify({ error: "Failed to fetch API keys" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Return connected status only (not the actual keys for security)
        return new Response(
            JSON.stringify({
                connections: {
                    github: !!data?.github_key,
                    gemini: !!data?.gemini_key,
                    chatgpt: !!data?.chatgpt_key,
                    claude: !!data?.claude_key,
                    perplexity: !!data?.perplexity_key,
                    grok: !!data?.grok_key,
                    deepseek: !!data?.deepseek_key,
                    groq: !!data?.groq_key,
                    exa: !!data?.exa_key,
                },
                github_active_model: data?.github_active_model || null,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("get-api-keys error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
