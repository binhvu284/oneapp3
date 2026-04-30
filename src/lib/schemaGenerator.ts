/**
 * ============================================================================
 * @file schemaGenerator.ts
 * @description Dynamic SQL generation from OneApp database schema.
 * 
 * Đây là file logic cốt lõi (core file) chịu trách nhiệm tự động sinh ra mã 
 * SQL DDL (Data Definition Language) và RLS (Row Level Security) policies 
 * dựa trên cấu trúc schema được định nghĩa trong `data-layer/schema.ts`.
 * 
 * Mục đích:
 * 1. Đảm bảo tính nhất quán giữa frontend types và database schema.
 * 2. Cung cấp khả năng migration và khởi tạo database động cho 
 *    các môi trường khác nhau (External Database vs Lovable Cloud).
 * 3. Sinh ra các triggers tự động cập nhật `updated_at`.
 * 
 * Lưu ý: File này sinh ra mã SQL Idempotent (chạy lại nhiều lần không lỗi).
 * ============================================================================
 */

// Schema Generator - Dynamic SQL generation from OneApp database schema
// This file imports the authoritative schema from data-layer/schema.ts
// to ensure consistency across the app
import {
  CORE_TABLES,
  LOVABLE_ONLY_TABLES,
  ONEAPP_SCHEMA_VERSION
} from './data-layer/schema';
import type { TableDefinition as DataLayerTable } from './data-layer/types';

// Table categories for environment-specific filtering
export type TableCategory = 'core' | 'lovable-only' | 'external-only';

export type SchemaContext = 'all' | 'external' | 'lovable';

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  category: TableCategory;
  description?: string;
}

// Table descriptions mapping
const TABLE_DESCRIPTIONS: Record<string, string> = {
  oneapp_users: "Custom user accounts (email, password_hash, level)",
  user_roles: "User role assignments",
  role_permissions: "Role-based permissions",
  user_sessions: "User session management",
  profiles: "User profile information",
  user_settings: "Theme & display preferences",
  user_api_keys: "AI API keys storage",
  categories: "App categories/folders",
  in_use_apps: "User's installed apps",
  app_categories: "Many-to-many app-category relationship",
  conversations: "AI chat conversations",
  messages: "Chat messages",
  notes: "Notes with block content",
  note_items: "Task items with sub-tasks",
  note_folders: "Hierarchical folder structure",
  note_tags: "User-defined tags",
  note_tag_links: "Note-tag junction table",
  note_reminders: "Note reminders with dismiss tracking",
  note_shares: "Share tokens for public note access",
  note_templates: "System & user templates",
  crypto_platforms: "Exchange/wallet connections",
  crypto_holdings: "User crypto holdings per platform",
  crypto_transactions: "Crypto transaction records",
  crypto_watchlist: "Coin watchlist with price alerts",
  partner_keys: "Partner registration keys with usage tracking",
  verified_emails: "Pre-verified emails for partner signup",
  external_connections: "Legacy per-user connections (managed by Lovable Cloud)",
  system_connection: "System-wide external Supabase config (managed by Lovable Cloud)",
};

// Convert data-layer table to generator format
function convertToGeneratorFormat(table: DataLayerTable, category: TableCategory): TableDefinition {
  return {
    name: table.name,
    category,
    description: TABLE_DESCRIPTIONS[table.name],
    columns: table.columns.map(col => ({
      name: col.name,
      type: mapColumnType(col.type, col.enumValues),
      nullable: col.nullable,
      primaryKey: col.isPrimaryKey,
      defaultValue: formatDefaultValue(col.defaultValue),
    })),
  };
}

// Map data-layer column types to SQL types
function mapColumnType(type: string, enumValues?: string[]): string {
  if (type === 'enum' && enumValues) {
    // Detect which enum type based on values
    if (enumValues.includes('admin')) return 'oneapp_role';
    if (enumValues.includes('buy')) return 'crypto_transaction_type';
    if (enumValues.includes('available')) return 'app_status';
    return 'oneapp_role'; // fallback
  }

  const typeMap: Record<string, string> = {
    uuid: 'UUID',
    text: 'TEXT',
    boolean: 'BOOLEAN',
    integer: 'INTEGER',
    numeric: 'NUMERIC',
    jsonb: 'JSONB',
    timestamptz: 'TIMESTAMPTZ',
  };

  return typeMap[type.toLowerCase()] || type.toUpperCase();
}

// Format default value for SQL
function formatDefaultValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === 'string') {
    // Check if it's a SQL function call
    if (value.includes('(') || value.includes('now') || value.includes('random')) {
      return value;
    }
    return `'${value}'`;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
}

// Build ONEAPP_TABLES from the authoritative data-layer schema
export const ONEAPP_TABLES: TableDefinition[] = [
  // Core tables (synced to all datasources)
  ...CORE_TABLES.map(t => convertToGeneratorFormat(t, 'core')),
  // Lovable-only tables (not synced to external)
  ...LOVABLE_ONLY_TABLES.map(t => convertToGeneratorFormat(t, 'lovable-only')),
];

// Export schema version
export { ONEAPP_SCHEMA_VERSION };

// Filter tables by context
export function getTablesForContext(context: SchemaContext): TableDefinition[] {
  switch (context) {
    case 'external':
      // External DB: core tables only (no lovable-only tables)
      return ONEAPP_TABLES.filter(t => t.category === 'core');
    case 'lovable':
      // Lovable Cloud: core tables + lovable-only tables
      return ONEAPP_TABLES.filter(t => t.category === 'core' || t.category === 'lovable-only');
    case 'all':
    default:
      return ONEAPP_TABLES;
  }
}

// Get category badge info for UI
export function getCategoryBadge(category: TableCategory): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  switch (category) {
    case 'core':
      return { label: 'Core', variant: 'default' };
    case 'lovable-only':
      return { label: 'Lovable Only', variant: 'secondary' };
    case 'external-only':
      return { label: 'External Only', variant: 'outline' };
  }
}

// Generate column definition SQL
function generateColumnSQL(col: ColumnDefinition): string {
  let sql = `  ${col.name} ${col.type}`;

  if (col.primaryKey) {
    sql += " PRIMARY KEY";
  }

  if (!col.nullable) {
    sql += " NOT NULL";
  }

  if (col.defaultValue) {
    sql += ` DEFAULT ${col.defaultValue}`;
  }

  return sql;
}

// Generate CREATE TABLE SQL for a single table (idempotent)
function generateTableSQL(table: TableDefinition): string {
  const columns = table.columns.map(generateColumnSQL).join(",\n");
  return `CREATE TABLE IF NOT EXISTS public.${table.name} (\n${columns}\n);`;
}

// Generate RLS policies for a table (idempotent - drop before create)
function generateRLSPolicies(tableName: string): string {
  // system_connection table has special RLS - singleton, all authenticated can view
  if (tableName === "system_connection") {
    return [
      `-- Enable RLS for system_connection`,
      `ALTER TABLE public.system_connection ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "All authenticated users can view system connection" ON public.system_connection;`,
      `CREATE POLICY "All authenticated users can view system connection"`,
      `ON public.system_connection FOR SELECT`,
      `USING (true);`,
      "",
      `DROP POLICY IF EXISTS "Authenticated users can create system connection" ON public.system_connection;`,
      `CREATE POLICY "Authenticated users can create system connection"`,
      `ON public.system_connection FOR INSERT`,
      `WITH CHECK (true);`,
      "",
      `DROP POLICY IF EXISTS "Configured user can update system connection" ON public.system_connection;`,
      `CREATE POLICY "Configured user can update system connection"`,
      `ON public.system_connection FOR UPDATE`,
      `USING (auth.uid() = configured_by);`,
      "",
      `DROP POLICY IF EXISTS "Configured user can delete system connection" ON public.system_connection;`,
      `CREATE POLICY "Configured user can delete system connection"`,
      `ON public.system_connection FOR DELETE`,
      `USING (auth.uid() = configured_by);`,
    ].join("\n");
  }

  // oneapp_users has special RLS with level-based access
  if (tableName === "oneapp_users") {
    return [
      `-- Enable RLS for oneapp_users`,
      `ALTER TABLE public.oneapp_users ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Allow signup insert" ON public.oneapp_users;`,
      `CREATE POLICY "Allow signup insert"`,
      `ON public.oneapp_users FOR INSERT`,
      `WITH CHECK (true);`,
      "",
      `DROP POLICY IF EXISTS "Users can view own profile" ON public.oneapp_users;`,
      `CREATE POLICY "Users can view own profile"`,
      `ON public.oneapp_users FOR SELECT`,
      `USING (id = (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));`,
      "",
      `DROP POLICY IF EXISTS "Users can update own profile" ON public.oneapp_users;`,
      `CREATE POLICY "Users can update own profile"`,
      `ON public.oneapp_users FOR UPDATE`,
      `USING (id = (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can view all users" ON public.oneapp_users;`,
      `CREATE POLICY "Admins can view all users"`,
      `ON public.oneapp_users FOR SELECT`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can update all users" ON public.oneapp_users;`,
      `CREATE POLICY "Admins can update all users"`,
      `ON public.oneapp_users FOR UPDATE`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can delete users" ON public.oneapp_users;`,
      `CREATE POLICY "Admins can delete users"`,
      `ON public.oneapp_users FOR DELETE`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
    ].join("\n");
  }

  // user_roles has special RLS
  if (tableName === "user_roles") {
    return [
      `-- Enable RLS for user_roles`,
      `ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;`,
      `CREATE POLICY "Users can view own roles"`,
      `ON public.user_roles FOR SELECT`,
      `USING (user_id = (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;`,
      `CREATE POLICY "Admins can view all roles"`,
      `ON public.user_roles FOR SELECT`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;`,
      `CREATE POLICY "Admins can insert roles"`,
      `ON public.user_roles FOR INSERT`,
      `WITH CHECK (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
      "",
      `DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;`,
      `CREATE POLICY "Admins can delete roles"`,
      `ON public.user_roles FOR DELETE`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
    ].join("\n");
  }

  // role_permissions has special RLS
  if (tableName === "role_permissions") {
    return [
      `-- Enable RLS for role_permissions`,
      `ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Anyone can view permissions" ON public.role_permissions;`,
      `CREATE POLICY "Anyone can view permissions"`,
      `ON public.role_permissions FOR SELECT`,
      `USING (true);`,
      "",
      `DROP POLICY IF EXISTS "Admins can manage permissions" ON public.role_permissions;`,
      `CREATE POLICY "Admins can manage permissions"`,
      `ON public.role_permissions FOR ALL`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 1));`,
    ].join("\n");
  }

  // user_sessions has special RLS
  if (tableName === "user_sessions") {
    return [
      `-- Enable RLS for user_sessions`,
      `ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Allow session insert" ON public.user_sessions;`,
      `CREATE POLICY "Allow session insert"`,
      `ON public.user_sessions FOR INSERT`,
      `WITH CHECK (true);`,
      "",
      `DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;`,
      `CREATE POLICY "Users can view own sessions"`,
      `ON public.user_sessions FOR SELECT`,
      `USING (user_id = (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));`,
      "",
      `DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;`,
      `CREATE POLICY "Users can delete own sessions"`,
      `ON public.user_sessions FOR DELETE`,
      `USING (user_id = (SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1));`,
    ].join("\n");
  }

  const userIdColumn = tableName === "profiles" ? "id" : "user_id";

  // messages table uses conversation ownership check
  if (tableName === "messages") {
    return [
      `-- Enable RLS for messages`,
      `ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Users can manage messages in own conversations" ON public.messages;`,
      `CREATE POLICY "Users can manage messages in own conversations"`,
      `ON public.messages FOR ALL`,
      `USING (EXISTS (`,
      `  SELECT 1 FROM conversations`,
      `  WHERE conversations.id = messages.conversation_id`,
      `  AND conversations.user_id = auth.uid()`,
      `));`,
    ].join("\n");
  }

  // partner_keys has admin + public read policies
  if (tableName === "partner_keys") {
    return [
      `-- Enable RLS for partner_keys`,
      `ALTER TABLE public.partner_keys ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Anyone can verify partner keys" ON public.partner_keys;`,
      `CREATE POLICY "Anyone can verify partner keys"`,
      `ON public.partner_keys FOR SELECT`,
      `USING (true);`,
      "",
      `DROP POLICY IF EXISTS "Admins can manage partner keys" ON public.partner_keys;`,
      `CREATE POLICY "Admins can manage partner keys"`,
      `ON public.partner_keys FOR ALL`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 2));`,
    ].join("\n");
  }

  // verified_emails has admin + public read policies
  if (tableName === "verified_emails") {
    return [
      `-- Enable RLS for verified_emails`,
      `ALTER TABLE public.verified_emails ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Anyone can check verified emails" ON public.verified_emails;`,
      `CREATE POLICY "Anyone can check verified emails"`,
      `ON public.verified_emails FOR SELECT`,
      `USING (true);`,
      "",
      `DROP POLICY IF EXISTS "Admins can manage verified emails" ON public.verified_emails;`,
      `CREATE POLICY "Admins can manage verified emails"`,
      `ON public.verified_emails FOR ALL`,
      `USING (has_higher_or_equal_level((SELECT ou.id FROM oneapp_users ou WHERE ou.lovable_user_id = auth.uid() LIMIT 1), 2));`,
    ].join("\n");
  }

  // note_shares has public active + owner policies
  if (tableName === "note_shares") {
    return [
      `-- Enable RLS for note_shares`,
      `ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Public can view active shares" ON public.note_shares;`,
      `CREATE POLICY "Public can view active shares"`,
      `ON public.note_shares FOR SELECT`,
      `USING (is_active = true);`,
      "",
      `DROP POLICY IF EXISTS "Users can view own shares" ON public.note_shares;`,
      `CREATE POLICY "Users can view own shares"`,
      `ON public.note_shares FOR SELECT`,
      `USING (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can create own shares" ON public.note_shares;`,
      `CREATE POLICY "Users can create own shares"`,
      `ON public.note_shares FOR INSERT`,
      `WITH CHECK (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can update own shares" ON public.note_shares;`,
      `CREATE POLICY "Users can update own shares"`,
      `ON public.note_shares FOR UPDATE`,
      `USING (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can delete own shares" ON public.note_shares;`,
      `CREATE POLICY "Users can delete own shares"`,
      `ON public.note_shares FOR DELETE`,
      `USING (auth.uid() = user_id);`,
    ].join("\n");
  }

  // note_templates has system + owner policies
  if (tableName === "note_templates") {
    return [
      `-- Enable RLS for note_templates`,
      `ALTER TABLE public.note_templates ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Users can view system templates" ON public.note_templates;`,
      `CREATE POLICY "Users can view system templates"`,
      `ON public.note_templates FOR SELECT`,
      `USING (is_system = true);`,
      "",
      `DROP POLICY IF EXISTS "Users can view own templates" ON public.note_templates;`,
      `CREATE POLICY "Users can view own templates"`,
      `ON public.note_templates FOR SELECT`,
      `USING (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can create own templates" ON public.note_templates;`,
      `CREATE POLICY "Users can create own templates"`,
      `ON public.note_templates FOR INSERT`,
      `WITH CHECK (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can update own templates" ON public.note_templates;`,
      `CREATE POLICY "Users can update own templates"`,
      `ON public.note_templates FOR UPDATE`,
      `USING (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can delete own templates" ON public.note_templates;`,
      `CREATE POLICY "Users can delete own templates"`,
      `ON public.note_templates FOR DELETE`,
      `USING (auth.uid() = user_id);`,
    ].join("\n");
  }

  // note_tag_links: no UPDATE policy
  if (tableName === "note_tag_links") {
    return [
      `-- Enable RLS for note_tag_links`,
      `ALTER TABLE public.note_tag_links ENABLE ROW LEVEL SECURITY;`,
      "",
      `DROP POLICY IF EXISTS "Users can view own note_tag_links" ON public.note_tag_links;`,
      `CREATE POLICY "Users can view own note_tag_links"`,
      `ON public.note_tag_links FOR SELECT`,
      `USING (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can insert own note_tag_links" ON public.note_tag_links;`,
      `CREATE POLICY "Users can insert own note_tag_links"`,
      `ON public.note_tag_links FOR INSERT`,
      `WITH CHECK (auth.uid() = user_id);`,
      "",
      `DROP POLICY IF EXISTS "Users can delete own note_tag_links" ON public.note_tag_links;`,
      `CREATE POLICY "Users can delete own note_tag_links"`,
      `ON public.note_tag_links FOR DELETE`,
      `USING (auth.uid() = user_id);`,
    ].join("\n");
  }

  const policies = [
    `-- Enable RLS for ${tableName}`,
    `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`,
    "",
    // SELECT policy
    `DROP POLICY IF EXISTS "Users can view own ${tableName}" ON public.${tableName};`,
    `CREATE POLICY "Users can view own ${tableName}"`,
    `ON public.${tableName} FOR SELECT`,
    `USING (auth.uid() = ${userIdColumn});`,
    "",
    // INSERT policy
    `DROP POLICY IF EXISTS "Users can insert own ${tableName}" ON public.${tableName};`,
    `CREATE POLICY "Users can insert own ${tableName}"`,
    `ON public.${tableName} FOR INSERT`,
    `WITH CHECK (auth.uid() = ${userIdColumn});`,
    "",
    // UPDATE policy
    `DROP POLICY IF EXISTS "Users can update own ${tableName}" ON public.${tableName};`,
    `CREATE POLICY "Users can update own ${tableName}"`,
    `ON public.${tableName} FOR UPDATE`,
    `USING (auth.uid() = ${userIdColumn});`,
  ];

  // Add delete policy for most tables (except profiles)
  if (tableName !== "profiles") {
    policies.push(
      "",
      `DROP POLICY IF EXISTS "Users can delete own ${tableName}" ON public.${tableName};`,
      `CREATE POLICY "Users can delete own ${tableName}"`,
      `ON public.${tableName} FOR DELETE`,
      `USING (auth.uid() = ${userIdColumn});`
    );
  }

  return policies.join("\n");
}

// Generate the complete SQL schema for a specific context
export function generateSQLForContext(context: SchemaContext): string {
  const tables = getTablesForContext(context);
  const sections: string[] = [];

  // Header with context info
  const contextLabels: Record<SchemaContext, string> = {
    all: 'All Environments',
    external: 'External Database',
    lovable: 'Lovable Cloud'
  };

  sections.push("-- ============================================");
  sections.push(`-- OneApp Database Schema v${ONEAPP_SCHEMA_VERSION} - ${contextLabels[context]}`);
  sections.push("-- Generated automatically - Always up to date");
  sections.push("-- FULLY IDEMPOTENT - Safe to run multiple times");
  sections.push("-- ============================================");
  sections.push("");

  // Context note
  if (context === 'external') {
    sections.push("-- NOTE: This schema is for EXTERNAL Supabase projects");
    sections.push("-- Includes all core tables for OneApp functionality");
    sections.push("-- Table 'system_connection' is NOT included (managed by Lovable Cloud)");
    sections.push("");
  } else if (context === 'lovable') {
    sections.push("-- NOTE: This schema reflects Lovable Cloud environment");
    sections.push("-- Includes 'system_connection' table for external DB config");
    sections.push("");
  }

  // Create enum types (with IF NOT EXISTS pattern)
  sections.push("-- Create enum types (safe - won't error if exists)");
  sections.push(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_status') THEN
    CREATE TYPE app_status AS ENUM ('available', 'disable', 'developing');
  END IF;
END
$$;`);
  sections.push("");
  sections.push(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oneapp_role') THEN
    CREATE TYPE oneapp_role AS ENUM ('admin', 'developer', 'business_partner', 'customer');
  END IF;
END
$$;`);
  sections.push("");
  sections.push(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crypto_transaction_type') THEN
    CREATE TYPE crypto_transaction_type AS ENUM ('buy', 'sell', 'transfer', 'receive');
  END IF;
END
$$;`);
  sections.push("");

  // Create tables (idempotent with IF NOT EXISTS)
  sections.push("-- ============================================");
  sections.push("-- TABLES (IF NOT EXISTS - safe to re-run)");
  sections.push("-- ============================================");
  sections.push("");

  for (const table of tables) {
    sections.push(`-- Table: ${table.name} [${table.category.toUpperCase()}]`);
    if (table.description) {
      sections.push(`-- ${table.description}`);
    }
    sections.push(generateTableSQL(table));
    sections.push("");
  }

  // Ensure all columns exist on tables that may already exist with older schema
  sections.push("-- ============================================");
  sections.push("-- ENSURE COLUMNS EXIST (safe for existing tables)");
  sections.push("-- Re-running on an existing DB will add any missing columns");
  sections.push("-- ============================================");
  sections.push("");

  for (const table of tables) {
    const alterStatements = table.columns
      .filter(col => !col.primaryKey) // Skip PK columns
      .map(col => {
        let stmt = `ALTER TABLE public.${table.name} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
        // For NOT NULL columns, always provide a DEFAULT to avoid failures on existing rows
        if (col.defaultValue) {
          stmt += ` DEFAULT ${col.defaultValue}`;
        } else if (!col.nullable && !col.defaultValue) {
          // Provide safe defaults based on type for NOT NULL columns without explicit defaults
          const safeDefaults: Record<string, string> = {
            'TEXT': "''",
            'INTEGER': '0',
            'NUMERIC': '0',
            'BOOLEAN': 'false',
            'UUID': 'gen_random_uuid()',
            'TIMESTAMPTZ': 'now()',
            'JSONB': "'{}'::jsonb",
          };
          const upperType = col.type.toUpperCase();
          const safeDef = safeDefaults[upperType];
          if (safeDef) stmt += ` DEFAULT ${safeDef}`;
        }
        if (!col.nullable) stmt += ` NOT NULL`;
        stmt += ';';
        return stmt;
      });
    if (alterStatements.length > 0) {
      sections.push(`-- Ensure columns for ${table.name}`);
      sections.push(...alterStatements);
      sections.push("");
    }
  }

  // Create security functions
  sections.push("-- ============================================");
  sections.push("-- SECURITY FUNCTIONS");
  sections.push("-- ============================================");
  sections.push("");

  sections.push(`-- Get user level function
CREATE OR REPLACE FUNCTION public.get_user_level(_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT level FROM public.oneapp_users WHERE id = _user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;`);
  sections.push("");

  sections.push(`-- Check if user has higher or equal level
CREATE OR REPLACE FUNCTION public.has_higher_or_equal_level(_user_id UUID, _target_level INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT level FROM public.oneapp_users WHERE id = _user_id) <= _target_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;`);
  sections.push("");

  sections.push(`-- Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_oneapp_role(_user_id UUID, _role oneapp_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;`);
  sections.push("");

  // Create update_updated_at function
  sections.push("-- ============================================");
  sections.push("-- UTILITY FUNCTIONS");
  sections.push("-- ============================================");
  sections.push("");
  sections.push(`CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;`);
  sections.push("");

  // Create triggers for updated_at
  sections.push("-- ============================================");
  sections.push("-- TRIGGERS");
  sections.push("-- ============================================");
  sections.push("");

  const tablesWithUpdatedAt = tables.filter(t =>
    t.columns.some(c => c.name === 'updated_at')
  );

  for (const table of tablesWithUpdatedAt) {
    sections.push(`DROP TRIGGER IF EXISTS update_${table.name}_updated_at ON public.${table.name};`);
    sections.push(`CREATE TRIGGER update_${table.name}_updated_at`);
    sections.push(`  BEFORE UPDATE ON public.${table.name}`);
    sections.push(`  FOR EACH ROW`);
    sections.push(`  EXECUTE FUNCTION public.update_updated_at_column();`);
    sections.push("");
  }

  // RLS policies
  sections.push("-- ============================================");
  sections.push("-- ROW LEVEL SECURITY POLICIES");
  sections.push("-- ============================================");
  sections.push("");

  for (const table of tables) {
    sections.push(generateRLSPolicies(table.name));
    sections.push("");
  }

  return sections.join("\n");
}

// Shortcut for generating complete schema
export function generateFullSQLSchema(): string {
  return generateSQLForContext('all');
}

// Get table summary for UI display
export function getTableSummary(context: SchemaContext = 'all'): Array<{
  name: string;
  columnCount: number;
  columns: string[];
  category: TableCategory;
  description?: string;
}> {
  const tables = getTablesForContext(context);
  return tables.map(table => ({
    name: table.name,
    columnCount: table.columns.length,
    columns: table.columns.map(c => c.name),
    category: table.category,
    description: table.description,
  }));
}

// Get table counts by category
export function getTableCountsByCategory(): Record<TableCategory, number> {
  const counts: Record<TableCategory, number> = {
    'core': 0,
    'lovable-only': 0,
    'external-only': 0,
  };

  for (const table of ONEAPP_TABLES) {
    counts[table.category]++;
  }

  return counts;
}
