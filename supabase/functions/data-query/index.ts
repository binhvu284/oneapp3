import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";


// ============================================================================
// Schema Definition (embedded for edge function)
// ============================================================================

const CORE_TABLES = [
  {
    name: 'oneapp_users',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'email', type: 'text', nullable: false, isUnique: true },
      { name: 'password_hash', type: 'text', nullable: false },
      { name: 'display_name', type: 'text', nullable: true },
      { name: 'nickname', type: 'text', nullable: true },
      { name: 'avatar_url', type: 'text', nullable: true },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'level', type: 'integer', nullable: false, defaultValue: '4' },
      { name: 'email_verified', type: 'boolean', nullable: false, defaultValue: 'false' },
      { name: 'is_active', type: 'boolean', nullable: false, defaultValue: 'true' },
      { name: 'lovable_user_id', type: 'uuid', nullable: true },
      { name: 'github_url', type: 'text', nullable: true },
      { name: 'twitter_url', type: 'text', nullable: true },
      { name: 'linkedin_url', type: 'text', nullable: true },
      { name: 'website_url', type: 'text', nullable: true },
      { name: 'bio', type: 'text', nullable: true },
      { name: 'last_login_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'user_roles',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'role', type: 'oneapp_role', nullable: false },
      { name: 'assigned_by', type: 'uuid', nullable: true },
      { name: 'assigned_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'role_permissions',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'role', type: 'oneapp_role', nullable: false },
      { name: 'permission', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'user_sessions',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'token_hash', type: 'text', nullable: false },
      { name: 'device_info', type: 'text', nullable: true },
      { name: 'ip_address', type: 'text', nullable: true },
      { name: 'expires_at', type: 'timestamptz', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'last_used_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'profiles',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
      { name: 'display_name', type: 'text', nullable: true },
      { name: 'nickname', type: 'text', nullable: true },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'avatar_url', type: 'text', nullable: true },
      { name: 'github_url', type: 'text', nullable: true },
      { name: 'twitter_url', type: 'text', nullable: true },
      { name: 'linkedin_url', type: 'text', nullable: true },
      { name: 'website_url', type: 'text', nullable: true },
      { name: 'bio', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'user_settings',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false, isUnique: true },
      { name: 'theme', type: 'text', nullable: true },
      { name: 'custom_theme_colors', type: 'jsonb', nullable: true },
      { name: 'sidebar_settings', type: 'jsonb', nullable: true },
      { name: 'header_settings', type: 'jsonb', nullable: true },
      { name: 'layout_settings', type: 'jsonb', nullable: true },
      { name: 'display_settings', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'user_api_keys',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false, isUnique: true },
      { name: 'chatgpt_key', type: 'text', nullable: true },
      { name: 'gemini_key', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'categories',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'name', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'icon_name', type: 'text', nullable: true },
      { name: 'icon_url', type: 'text', nullable: true },
      { name: 'color', type: 'text', nullable: true },
      { name: 'sort_order', type: 'integer', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'in_use_apps',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'name', type: 'text', nullable: false },
      { name: 'route', type: 'text', nullable: false },
      { name: 'short_description', type: 'text', nullable: true },
      { name: 'long_description', type: 'text', nullable: true },
      { name: 'icon_url', type: 'text', nullable: true },
      { name: 'app_image_url', type: 'text', nullable: true },
      { name: 'status', type: 'text', nullable: false, defaultValue: "'developing'" },
      { name: 'sort_order', type: 'integer', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'app_categories',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'app_id', type: 'uuid', nullable: false },
      { name: 'category_id', type: 'uuid', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'conversations',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'user_id', type: 'uuid', nullable: true },
      { name: 'agent_id', type: 'text', nullable: false },
      { name: 'agent_name', type: 'text', nullable: false },
      { name: 'title', type: 'text', nullable: true },
      { name: 'last_message', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
  {
    name: 'messages',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, defaultValue: 'gen_random_uuid()', isPrimaryKey: true },
      { name: 'conversation_id', type: 'uuid', nullable: false },
      { name: 'role', type: 'text', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    ],
  },
];

// ============================================================================
// Types
// ============================================================================

interface DataQueryRequest {
  action: string;
  user_id?: string;
  supabase_url: string;
  supabase_service_key: string;
  data?: Record<string, unknown>;
  table?: string;
  options?: {
    select?: string;
    filters?: Array<{ column: string; operator: string; value: unknown }>;
    order?: Array<{ column: string; ascending?: boolean }>;
    limit?: number;
    offset?: number;
    single?: boolean;
  };
  filters?: Array<{ column: string; operator: string; value: unknown }>;
  conflict_columns?: string[];
  sql?: string;
}

interface SchemaValidationResult {
  isValid: boolean;
  missingTables: string[];
  missingColumns: Array<{ table: string; columns: string[] }>;
  typeMismatches: Array<{ table: string; column: string; expected: string; actual: string }>;
  migrationSQL?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapColumnType(type: string): string {
  const typeMap: Record<string, string> = {
    'uuid': 'UUID',
    'text': 'TEXT',
    'integer': 'INTEGER',
    'boolean': 'BOOLEAN',
    'jsonb': 'JSONB',
    'timestamptz': 'TIMESTAMP WITH TIME ZONE',
    'oneapp_role': 'oneapp_role',
  };
  return typeMap[type] || type.toUpperCase();
}

function generateMigrationSQL(validation: SchemaValidationResult): string {
  const statements: string[] = [];

  // 1. Create enum type if needed
  statements.push(`
-- Create oneapp_role enum if not exists
DO $$ BEGIN
  CREATE TYPE oneapp_role AS ENUM ('admin', 'developer', 'business_partner', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
  `.trim());

  // 2. Create missing tables
  for (const tableName of validation.missingTables) {
    const tableSchema = CORE_TABLES.find(t => t.name === tableName);
    if (!tableSchema) continue;

    const columnDefs = tableSchema.columns.map(col => {
      let def = `  ${col.name} ${mapColumnType(col.type)}`;
      if ((col as { isPrimaryKey?: boolean }).isPrimaryKey) def += ' PRIMARY KEY';
      if (!col.nullable) def += ' NOT NULL';
      if ((col as { isUnique?: boolean }).isUnique) def += ' UNIQUE';
      if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
      return def;
    }).join(',\n');

    statements.push(`
-- Create ${tableName} table
CREATE TABLE IF NOT EXISTS public.${tableName} (
${columnDefs}
);
    `.trim());

    // Enable RLS
    statements.push(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`);
  }

  // 3. Add missing columns
  for (const entry of validation.missingColumns) {
    const tableSchema = CORE_TABLES.find(t => t.name === entry.table);
    if (!tableSchema) continue;

    for (const columnName of entry.columns) {
      const colSchema = tableSchema.columns.find(c => c.name === columnName);
      if (!colSchema) continue;

      let colDef = `${mapColumnType(colSchema.type)}`;
      if (!colSchema.nullable) colDef += ' NOT NULL';
      if (colSchema.defaultValue) colDef += ` DEFAULT ${colSchema.defaultValue}`;

      statements.push(`
-- Add missing column ${columnName} to ${entry.table}
DO $$ BEGIN
  ALTER TABLE public.${entry.table} ADD COLUMN IF NOT EXISTS ${columnName} ${colDef};
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;
      `.trim());
    }
  }

  // 4. Create security functions
  statements.push(`
-- Create security functions
CREATE OR REPLACE FUNCTION public.has_oneapp_role(_user_id UUID, _role oneapp_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_level(_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (SELECT level FROM public.oneapp_users WHERE id = _user_id),
    999
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_higher_or_equal_level(_user_id UUID, _target_level INTEGER)
RETURNS BOOLEAN AS $$
  SELECT public.get_user_level(_user_id) <= _target_level
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
  `.trim());

  // 5. Create basic RLS policies for oneapp_users
  if (validation.missingTables.includes('oneapp_users')) {
    statements.push(`
-- RLS policies for oneapp_users
DROP POLICY IF EXISTS "Allow signup insert" ON public.oneapp_users;
CREATE POLICY "Allow signup insert" ON public.oneapp_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.oneapp_users;
CREATE POLICY "Users can view own profile" ON public.oneapp_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.oneapp_users;
CREATE POLICY "Users can update own profile" ON public.oneapp_users FOR UPDATE USING (true);
    `.trim());
  }

  // 6. Create RLS policies for user_roles
  if (validation.missingTables.includes('user_roles')) {
    statements.push(`
-- RLS policies for user_roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;
CREATE POLICY "Anyone can view roles" ON public.user_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert roles" ON public.user_roles;
CREATE POLICY "Allow insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);
    `.trim());
  }

  // 7. Create RLS policies for user_sessions
  if (validation.missingTables.includes('user_sessions')) {
    statements.push(`
-- RLS policies for user_sessions
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.user_sessions;
CREATE POLICY "Anyone can view sessions" ON public.user_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow session insert" ON public.user_sessions;
CREATE POLICY "Allow session insert" ON public.user_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow session delete" ON public.user_sessions;
CREATE POLICY "Allow session delete" ON public.user_sessions FOR DELETE USING (true);
    `.trim());
  }

  return statements.join('\n\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateSchema(externalClient: any): Promise<SchemaValidationResult> {
  const result: SchemaValidationResult = {
    isValid: true,
    missingTables: [],
    missingColumns: [],
    typeMismatches: [],
  };

  for (const tableSchema of CORE_TABLES) {
    const tableName = tableSchema.name;
    
    // Check if table exists
    const { error: tableError } = await externalClient
      .from(tableName)
      .select('*')
      .limit(0);

    if (tableError) {
      if (tableError.code === '42P01' || tableError.message?.includes('does not exist')) {
        result.missingTables.push(tableName);
        result.isValid = false;
        continue;
      }
    }

    // If table exists, check columns via a sample query
    const { data: sampleRow } = await externalClient
      .from(tableName)
      .select('*')
      .limit(1)
      .maybeSingle();

    if (sampleRow) {
      const existingColumns = Object.keys(sampleRow);
      const missingCols = tableSchema.columns
        .filter(col => !existingColumns.includes(col.name))
        .map(col => col.name);

      if (missingCols.length > 0) {
        result.missingColumns.push({ table: tableName, columns: missingCols });
        result.isValid = false;
      }
    }
  }

  if (!result.isValid) {
    result.migrationSQL = generateMigrationSQL(result);
  }

  return result;
}

// ============================================================================
// Request Handler
// ============================================================================

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DataQueryRequest = await req.json();
    const { action, supabase_url, supabase_service_key } = body;

    console.log(`[data-query] Action: ${action}`);

    // Validate required fields
    if (!supabase_url || !supabase_service_key) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing supabase_url or supabase_service_key" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create external Supabase client with service key
    const externalClient = createClient(supabase_url, supabase_service_key, {
      auth: { persistSession: false }
    });

    // Pre-validate table name for operations that use one
    const ALLOWED_TABLES = new Set(CORE_TABLES.map(t => t.name));
    if (body.table && !ALLOWED_TABLES.has(body.table)) {
      return new Response(
        JSON.stringify({ success: false, error: `Table '${body.table}' is not in the allowed schema` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      // ========================================================================
      // Test Connection
      // ========================================================================
      case "test-connection": {
        console.log("[data-query] Testing connection...");
        
        try {
          // Try to query any table to verify connection
          const { error } = await externalClient.from('oneapp_users').select('id').limit(1);
          
          // Even if table doesn't exist, connection works if we get a table error
          if (error && error.code !== '42P01' && !error.message?.includes('does not exist')) {
            console.error("[data-query] Connection test failed:", error);
            return new Response(
              JSON.stringify({ success: false, error: error.message }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          console.log("[data-query] Connection successful");
          return new Response(
            JSON.stringify({ success: true, message: "Connection successful" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("[data-query] Connection test error:", e);
          return new Response(
            JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Connection failed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // ========================================================================
      // Validate Schema
      // ========================================================================
      case "validate-schema": {
        console.log("[data-query] Validating schema...");
        
        try {
          const validation = await validateSchema(externalClient);
          
          console.log("[data-query] Schema validation result:", {
            isValid: validation.isValid,
            missingTables: validation.missingTables.length,
            missingColumns: validation.missingColumns.length,
          });
          
          return new Response(
            JSON.stringify({ success: true, validation }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("[data-query] Schema validation error:", e);
          return new Response(
            JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Validation failed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // ========================================================================
      // Run Migration
      // ========================================================================
      case "run-migration": {
        console.log("[data-query] Running migration...");
        
        try {
          // First validate to get current state
          const validation = await validateSchema(externalClient);
          
          if (validation.isValid) {
            console.log("[data-query] Schema is already valid, no migration needed");
            return new Response(
              JSON.stringify({ success: true, message: "Schema is already up to date" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          const migrationSQL = body.sql || validation.migrationSQL;
          
          if (!migrationSQL) {
            return new Response(
              JSON.stringify({ success: false, error: "No migration SQL generated" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          console.log("[data-query] Executing migration SQL...");
          
          // Split SQL into individual statements and execute
          const statements = migrationSQL
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
          
          const results: Array<{ statement: string; success: boolean; error?: string }> = [];
          
          for (const statement of statements) {
            if (!statement || statement.startsWith('--')) continue;
            
            const fullStatement = statement.endsWith(';') ? statement : `${statement};`;
            
            try {
              // Use RPC to execute raw SQL (requires a helper function or direct execution)
              // Since we can't execute raw SQL directly, we'll use a different approach
              // We'll create tables using the REST API patterns where possible
              
              // For now, we'll try to execute via RPC if available, or return the SQL for manual execution
              const { error: rpcError } = await externalClient.rpc('exec_sql', { 
                sql_query: fullStatement 
              });
              
              if (rpcError) {
                // If exec_sql doesn't exist, we need to handle differently
                if (rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
                  // Try alternative: return SQL for manual execution
                  results.push({ 
                    statement: fullStatement.substring(0, 100) + '...', 
                    success: false, 
                    error: 'Manual execution required' 
                  });
                } else {
                  results.push({ 
                    statement: fullStatement.substring(0, 100) + '...', 
                    success: false, 
                    error: rpcError.message 
                  });
                }
              } else {
                results.push({ statement: fullStatement.substring(0, 100) + '...', success: true });
              }
            } catch (e) {
              results.push({ 
                statement: fullStatement.substring(0, 100) + '...', 
                success: false, 
                error: e instanceof Error ? e.message : 'Unknown error' 
              });
            }
          }
          
          const allSuccess = results.every(r => r.success);
          const needsManualExecution = results.some(r => r.error === 'Manual execution required');
          
          if (needsManualExecution) {
            console.log("[data-query] Migration requires manual execution");
            return new Response(
              JSON.stringify({ 
                success: false, 
                needsManualExecution: true,
                migrationSQL,
                message: "Please execute the migration SQL manually in your Supabase dashboard"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          console.log("[data-query] Migration completed:", { allSuccess, results: results.length });
          
          return new Response(
            JSON.stringify({ 
              success: allSuccess, 
              results,
              message: allSuccess ? "Migration completed successfully" : "Some statements failed"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (e) {
          console.error("[data-query] Migration error:", e);
          return new Response(
            JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Migration failed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // ========================================================================
      // Generic Query
      // ========================================================================
      case "query": {
        const { table, options } = body;

        if (!table) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing table name" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[data-query] Querying table: ${table}`);

        let query = externalClient.from(table).select(options?.select || '*');

        // Apply filters
        if (options?.filters) {
          for (const filter of options.filters) {
            switch (filter.operator) {
              case 'eq': query = query.eq(filter.column, filter.value); break;
              case 'neq': query = query.neq(filter.column, filter.value); break;
              case 'gt': query = query.gt(filter.column, filter.value); break;
              case 'gte': query = query.gte(filter.column, filter.value); break;
              case 'lt': query = query.lt(filter.column, filter.value); break;
              case 'lte': query = query.lte(filter.column, filter.value); break;
              case 'like': query = query.like(filter.column, filter.value as string); break;
              case 'ilike': query = query.ilike(filter.column, filter.value as string); break;
              case 'in': query = query.in(filter.column, filter.value as unknown[]); break;
              case 'is': query = query.is(filter.column, filter.value); break;
            }
          }
        }

        // Apply order
        if (options?.order) {
          for (const orderItem of options.order) {
            query = query.order(orderItem.column, { ascending: orderItem.ascending ?? true });
          }
        }

        // Apply limit
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        // Apply offset
        if (options?.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        // Execute
        const { data, error, count } = options?.single 
          ? await query.maybeSingle()
          : await query;

        if (error) {
          console.error("[data-query] Query error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, result: data, count }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================================================
      // Insert
      // ========================================================================
      case "insert": {
        const { table, data } = body;
        
        if (!table || !data) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing table or data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[data-query] Inserting into table: ${table}`);

        const { data: result, error } = await externalClient
          .from(table)
          .insert(data)
          .select()
          .single();

        if (error) {
          console.error("[data-query] Insert error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================================================
      // Update
      // ========================================================================
      case "update": {
        const { table, data, filters } = body;
        
        if (!table || !data || !filters?.length) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing table, data, or filters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[data-query] Updating table: ${table}`);

        let query = externalClient.from(table).update(data);

        for (const filter of filters) {
          if (filter.operator === 'eq') {
            query = query.eq(filter.column, filter.value);
          }
        }

        const { data: result, error } = await query.select();

        if (error) {
          console.error("[data-query] Update error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================================================
      // Upsert
      // ========================================================================
      case "upsert": {
        const { table, data, conflict_columns } = body;
        
        if (!table || !data) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing table or data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[data-query] Upserting into table: ${table}`);

        const upsertOptions = conflict_columns?.length 
          ? { onConflict: conflict_columns.join(',') }
          : {};

        const { data: result, error } = await externalClient
          .from(table)
          .upsert(data, upsertOptions)
          .select();

        if (error) {
          console.error("[data-query] Upsert error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================================================
      // Delete
      // ========================================================================
      case "delete": {
        const { table, filters } = body;
        
        if (!table || !filters?.length) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing table or filters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`[data-query] Deleting from table: ${table}`);

        let query = externalClient.from(table).delete();

        for (const filter of filters) {
          if (filter.operator === 'eq') {
            query = query.eq(filter.column, filter.value);
          }
        }

        const { error } = await query;

        if (error) {
          console.error("[data-query] Delete error:", error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // ========================================================================
      // Legacy Profile Actions (kept for backwards compatibility)
      // ========================================================================
      case "get-profile": {
        const { user_id } = body;
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "Missing user_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: profile, error } = await externalClient
          .from("profiles")
          .select("*")
          .eq("id", user_id)
          .maybeSingle();

        if (error && error.code !== '42P01') {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, profile }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update-profile": {
        const { user_id, data } = body;
        if (!user_id || !data) {
          return new Response(
            JSON.stringify({ error: "Missing user_id or data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await externalClient
          .from("profiles")
          .upsert({ id: user_id, ...data, updated_at: new Date().toISOString() }, { onConflict: 'id' });

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "create-profile": {
        const { user_id, data } = body;
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: "Missing user_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await externalClient
          .from("profiles")
          .insert({ id: user_id, ...data });

        if (error && error.code !== '23505') { // Ignore duplicate key error
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
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
    console.error("[data-query] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
