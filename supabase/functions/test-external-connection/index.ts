import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase_url, supabase_anon_key, supabase_service_key } = await req.json();

    // Validate inputs
    if (!supabase_url || !supabase_anon_key) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: supabase_url and supabase_anon_key' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate URL format
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
    if (!urlPattern.test(supabase_url)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Supabase URL format. Expected: https://[project-id].supabase.co' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate anon key format (JWT structure)
    const jwtPattern = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
    if (!jwtPattern.test(supabase_anon_key)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid anon key format. Expected a valid JWT token.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate service key format if provided
    if (supabase_service_key && !jwtPattern.test(supabase_service_key)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid service key format. Expected a valid JWT token.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Testing connection to:', supabase_url);
    console.log('Using service key:', !!supabase_service_key);

    // Use service key if available for testing (bypasses RLS), otherwise use anon key
    const testKey = supabase_service_key || supabase_anon_key;
    
    // Try to create a client and make a simple query
    const externalClient = createClient(supabase_url, testKey);
    
    // Try to access the profiles table - this tests both connection and if schema exists
    const { data, error } = await externalClient
      .from('profiles')
      .select('id')
      .limit(1);

    // Analyze the result
    if (error) {
      console.log('Query error:', error.code, error.message);
      
      // PGRST116 = table not found (schema not set up)
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            connected: true,
            schema_exists: false,
            message: 'Connected successfully, but OneApp schema not found. Please run the SQL schema first.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // 42501 = RLS policy blocks access (connection works, schema exists)
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            connected: true,
            schema_exists: true,
            message: 'Connected successfully! Schema is set up and RLS is active.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // JWT/auth errors
      if (error.message?.includes('JWT') || error.message?.includes('invalid')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid API key. Please check your anon key.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Other errors
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Connection failed: ${error.message}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success - connection works and schema exists
    console.log('Connection successful, found', data?.length || 0, 'profiles');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        connected: true,
        schema_exists: true,
        message: 'Connected successfully! Schema is set up correctly.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Network/DNS errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not reach the Supabase server. Please check the URL.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${errorMessage}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
