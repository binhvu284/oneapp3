/**
 * OneApp Standard Schema Definition
 * 
 * This file defines the official schema that all datasources must conform to.
 * Used for schema validation and auto-migration.
 * 
 * Last synced with database: 2026-02-11
 */

import { SchemaDefinition, TableDefinition, ColumnType } from './types';

export const ONEAPP_SCHEMA_VERSION = '2.8.0';

// ============================================================================
// Enums
// ============================================================================

export const ONEAPP_ROLES = ['admin', 'developer', 'business_partner', 'customer'] as const;
export type OneAppRole = typeof ONEAPP_ROLES[number];

export const ROLE_LEVELS: Record<OneAppRole, number> = {
  admin: 1,
  developer: 2,
  business_partner: 3,
  customer: 4,
};

export const APP_STATUSES = ['available', 'disable', 'developing'] as const;
export const CRYPTO_TRANSACTION_TYPES = ['buy', 'sell', 'transfer', 'receive'] as const;

// ============================================================================
// Auth & Users Tables
// ============================================================================

const oneappUsersTable: TableDefinition = {
  name: 'oneapp_users',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'email', type: 'text', nullable: false, isUnique: true },
    { name: 'password_hash', type: 'text', nullable: false, defaultValue: "''" },
    { name: 'display_name', type: 'text', nullable: true },
    { name: 'nickname', type: 'text', nullable: true },
    { name: 'avatar_url', type: 'text', nullable: true },
    { name: 'bio', type: 'text', nullable: true },
    { name: 'phone', type: 'text', nullable: true },
    { name: 'github_url', type: 'text', nullable: true },
    { name: 'twitter_url', type: 'text', nullable: true },
    { name: 'linkedin_url', type: 'text', nullable: true },
    { name: 'website_url', type: 'text', nullable: true },
    { name: 'level', type: 'integer', nullable: false, defaultValue: 4 },
    { name: 'is_active', type: 'boolean', nullable: false, defaultValue: true },
    { name: 'email_verified', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'must_change_password', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'last_login_at', type: 'timestamptz', nullable: true },
    { name: 'lovable_user_id', type: 'uuid', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const userRolesTable: TableDefinition = {
  name: 'user_roles',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false, references: { table: 'oneapp_users', column: 'id' } },
    { name: 'role', type: 'enum', nullable: false, enumValues: ['admin', 'developer', 'business_partner', 'customer'] },
    { name: 'assigned_by', type: 'uuid', nullable: true, references: { table: 'oneapp_users', column: 'id' } },
    { name: 'assigned_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const rolePermissionsTable: TableDefinition = {
  name: 'role_permissions',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'role', type: 'enum', nullable: false, enumValues: ['admin', 'developer', 'business_partner', 'customer'] },
    { name: 'permission', type: 'text', nullable: false },
    { name: 'description', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const userSessionsTable: TableDefinition = {
  name: 'user_sessions',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false, references: { table: 'oneapp_users', column: 'id' } },
    { name: 'token_hash', type: 'text', nullable: false },
    { name: 'device_info', type: 'text', nullable: true },
    { name: 'ip_address', type: 'text', nullable: true },
    { name: 'expires_at', type: 'timestamptz', nullable: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'last_used_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const profilesTable: TableDefinition = {
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
  primaryKey: ['id'],
};

const userSettingsTable: TableDefinition = {
  name: 'user_settings',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false, isUnique: true },
    { name: 'theme', type: 'text', nullable: true, defaultValue: 'dark' },
    { name: 'custom_theme_colors', type: 'jsonb', nullable: true },
    { name: 'sidebar_settings', type: 'jsonb', nullable: true },
    { name: 'header_settings', type: 'jsonb', nullable: true },
    { name: 'layout_settings', type: 'jsonb', nullable: true },
    { name: 'display_settings', type: 'jsonb', nullable: true },
    { name: 'dashboard_settings', type: 'jsonb', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// Apps & Library Tables
// ============================================================================

const userApiKeysTable: TableDefinition = {
  name: 'user_api_keys',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false, isUnique: true },
    { name: 'chatgpt_key', type: 'text', nullable: true },
    { name: 'gemini_key', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const categoriesTable: TableDefinition = {
  name: 'categories',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false },
    { name: 'description', type: 'text', nullable: true },
    { name: 'icon_name', type: 'text', nullable: true, defaultValue: 'Folder' },
    { name: 'icon_url', type: 'text', nullable: true },
    { name: 'color', type: 'text', nullable: true, defaultValue: '#3b82f6' },
    { name: 'sort_order', type: 'integer', nullable: true, defaultValue: 0 },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const inUseAppsTable: TableDefinition = {
  name: 'in_use_apps',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false },
    { name: 'route', type: 'text', nullable: false },
    { name: 'short_description', type: 'text', nullable: true },
    { name: 'long_description', type: 'text', nullable: true },
    { name: 'icon_url', type: 'text', nullable: true },
    { name: 'app_image_url', type: 'text', nullable: true },
    { name: 'status', type: 'text', nullable: false, defaultValue: 'developing' },
    { name: 'sort_order', type: 'integer', nullable: true, defaultValue: 0 },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const appCategoriesTable: TableDefinition = {
  name: 'app_categories',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'app_id', type: 'uuid', nullable: false, references: { table: 'in_use_apps', column: 'id' } },
    { name: 'category_id', type: 'uuid', nullable: false, references: { table: 'categories', column: 'id' } },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// AI Chat Tables
// ============================================================================

const conversationsTable: TableDefinition = {
  name: 'conversations',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: true },
    { name: 'agent_id', type: 'text', nullable: false },
    { name: 'agent_name', type: 'text', nullable: false },
    { name: 'title', type: 'text', nullable: true },
    { name: 'last_message', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const messagesTable: TableDefinition = {
  name: 'messages',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'conversation_id', type: 'uuid', nullable: false, references: { table: 'conversations', column: 'id' } },
    { name: 'role', type: 'text', nullable: false },
    { name: 'content', type: 'text', nullable: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// OneNote Tables
// ============================================================================

const notesTable: TableDefinition = {
  name: 'notes',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'title', type: 'text', nullable: true, defaultValue: '' },
    { name: 'content', type: 'text', nullable: true, defaultValue: '' },
    { name: 'note_type', type: 'text', nullable: false, defaultValue: 'note' },
    { name: 'color', type: 'text', nullable: true },
    { name: 'folder_id', type: 'uuid', nullable: true, references: { table: 'note_folders', column: 'id' } },
    { name: 'is_pinned', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'is_archived', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'parent_id', type: 'uuid', nullable: true },
    { name: 'sort_order', type: 'integer', nullable: false, defaultValue: 0 },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteItemsTable: TableDefinition = {
  name: 'note_items',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'note_id', type: 'uuid', nullable: false, references: { table: 'notes', column: 'id' } },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'content', type: 'text', nullable: true, defaultValue: '' },
    { name: 'is_completed', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'sort_order', type: 'integer', nullable: false, defaultValue: 0 },
    { name: 'due_date', type: 'timestamptz', nullable: true },
    { name: 'priority', type: 'text', nullable: true },
    { name: 'parent_item_id', type: 'uuid', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteFoldersTable: TableDefinition = {
  name: 'note_folders',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false, defaultValue: '' },
    { name: 'parent_id', type: 'uuid', nullable: true, references: { table: 'note_folders', column: 'id' } },
    { name: 'icon_name', type: 'text', nullable: true, defaultValue: 'Folder' },
    { name: 'color', type: 'text', nullable: true, defaultValue: '#3b82f6' },
    { name: 'sort_order', type: 'integer', nullable: false, defaultValue: 0 },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteTagsTable: TableDefinition = {
  name: 'note_tags',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false },
    { name: 'color', type: 'text', nullable: true, defaultValue: '#3b82f6' },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteTagLinksTable: TableDefinition = {
  name: 'note_tag_links',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'note_id', type: 'uuid', nullable: false, references: { table: 'notes', column: 'id' } },
    { name: 'tag_id', type: 'uuid', nullable: false, references: { table: 'note_tags', column: 'id' } },
    { name: 'user_id', type: 'uuid', nullable: false },
  ],
  primaryKey: ['id'],
};

const noteRemindersTable: TableDefinition = {
  name: 'note_reminders',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'note_id', type: 'uuid', nullable: false, references: { table: 'notes', column: 'id' } },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'remind_at', type: 'timestamptz', nullable: false },
    { name: 'is_dismissed', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteSharesTable: TableDefinition = {
  name: 'note_shares',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'note_id', type: 'uuid', nullable: false, references: { table: 'notes', column: 'id' } },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'share_token', type: 'text', nullable: false, defaultValue: "encode(extensions.gen_random_bytes(16), 'hex')" },
    { name: 'is_active', type: 'boolean', nullable: false, defaultValue: true },
    { name: 'expires_at', type: 'timestamptz', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const noteTemplatesTable: TableDefinition = {
  name: 'note_templates',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: true },
    { name: 'name', type: 'text', nullable: false },
    { name: 'description', type: 'text', nullable: true, defaultValue: '' },
    { name: 'content', type: 'text', nullable: true, defaultValue: '' },
    { name: 'note_type', type: 'text', nullable: false, defaultValue: 'note' },
    { name: 'icon_name', type: 'text', nullable: true, defaultValue: 'FileText' },
    { name: 'is_system', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// Crypto Tables
// ============================================================================

const cryptoPlatformsTable: TableDefinition = {
  name: 'crypto_platforms',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'platform_name', type: 'text', nullable: false },
    { name: 'api_key_encrypted', type: 'text', nullable: true },
    { name: 'api_secret_encrypted', type: 'text', nullable: true },
    { name: 'wallet_address', type: 'text', nullable: true },
    { name: 'is_connected', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'last_synced_at', type: 'timestamptz', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const cryptoHoldingsTable: TableDefinition = {
  name: 'crypto_holdings',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'coin_symbol', type: 'text', nullable: false },
    { name: 'coin_name', type: 'text', nullable: false },
    { name: 'quantity', type: 'numeric', nullable: false, defaultValue: 0 },
    { name: 'avg_buy_price', type: 'numeric', nullable: false, defaultValue: 0 },
    { name: 'current_price', type: 'numeric', nullable: true, defaultValue: 0 },
    { name: 'platform_id', type: 'uuid', nullable: true, references: { table: 'crypto_platforms', column: 'id' } },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const cryptoTransactionsTable: TableDefinition = {
  name: 'crypto_transactions',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'coin_symbol', type: 'text', nullable: false },
    { name: 'transaction_type', type: 'text', nullable: false },
    { name: 'quantity', type: 'numeric', nullable: false },
    { name: 'price_per_unit', type: 'numeric', nullable: false },
    { name: 'total_value', type: 'numeric', nullable: false },
    { name: 'currency', type: 'text', nullable: false, defaultValue: 'USD' },
    { name: 'notes', type: 'text', nullable: true },
    { name: 'platform_id', type: 'uuid', nullable: true, references: { table: 'crypto_platforms', column: 'id' } },
    { name: 'transaction_date', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const cryptoWatchlistTable: TableDefinition = {
  name: 'crypto_watchlist',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'coin_symbol', type: 'text', nullable: false },
    { name: 'coin_name', type: 'text', nullable: false },
    { name: 'alert_price_above', type: 'numeric', nullable: true },
    { name: 'alert_price_below', type: 'numeric', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// Registration Tables
// ============================================================================

const partnerKeysTable: TableDefinition = {
  name: 'partner_keys',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'key_code', type: 'text', nullable: false },
    { name: 'description', type: 'text', nullable: true },
    { name: 'is_active', type: 'boolean', nullable: false, defaultValue: true },
    { name: 'max_uses', type: 'integer', nullable: true, defaultValue: 1 },
    { name: 'current_uses', type: 'integer', nullable: false, defaultValue: 0 },
    { name: 'expires_at', type: 'timestamptz', nullable: true },
    { name: 'created_by', type: 'uuid', nullable: true, references: { table: 'oneapp_users', column: 'id' } },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const verifiedEmailsTable: TableDefinition = {
  name: 'verified_emails',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'email', type: 'text', nullable: false },
    { name: 'is_used', type: 'boolean', nullable: false, defaultValue: false },
    { name: 'used_at', type: 'timestamptz', nullable: true },
    { name: 'expires_at', type: 'timestamptz', nullable: true },
    { name: 'created_by', type: 'uuid', nullable: true, references: { table: 'oneapp_users', column: 'id' } },
    { name: 'created_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: false, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// Connection Tables
// ============================================================================

const externalConnectionsTable: TableDefinition = {
  name: 'external_connections',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'name', type: 'text', nullable: false, defaultValue: 'Supabase' },
    { name: 'supabase_url', type: 'text', nullable: true },
    { name: 'is_active', type: 'boolean', nullable: true, defaultValue: false },
    { name: 'connection_status', type: 'text', nullable: true, defaultValue: 'not_setup' },
    { name: 'error_message', type: 'text', nullable: true },
    { name: 'last_tested_at', type: 'timestamptz', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: true, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: true, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

const systemConnectionTable: TableDefinition = {
  name: 'system_connection',
  columns: [
    { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()' },
    { name: 'supabase_url', type: 'text', nullable: true },
    { name: 'supabase_anon_key', type: 'text', nullable: true },
    { name: 'supabase_service_key', type: 'text', nullable: true },
    { name: 'is_active', type: 'boolean', nullable: true, defaultValue: false },
    { name: 'connection_status', type: 'text', nullable: true, defaultValue: 'not_setup' },
    { name: 'error_message', type: 'text', nullable: true },
    { name: 'last_tested_at', type: 'timestamptz', nullable: true },
    { name: 'configured_by', type: 'uuid', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: true, defaultValue: 'now()' },
    { name: 'updated_at', type: 'timestamptz', nullable: true, defaultValue: 'now()' },
  ],
  primaryKey: ['id'],
};

// ============================================================================
// Schema Exports
// ============================================================================

/** 
 * Core tables that should exist in ALL datasources 
 * These are required for OneApp to function properly
 */
export const CORE_TABLES: TableDefinition[] = [
  // Auth & Users
  oneappUsersTable,
  userRolesTable,
  rolePermissionsTable,
  userSessionsTable,
  profilesTable,
  userSettingsTable,
  // Apps & Library
  userApiKeysTable,
  categoriesTable,
  inUseAppsTable,
  appCategoriesTable,
  // AI Chat
  conversationsTable,
  messagesTable,
  // OneNote
  noteFoldersTable,  // before notes (referenced by notes.folder_id)
  notesTable,
  noteItemsTable,
  noteTagsTable,
  noteTagLinksTable,
  noteRemindersTable,
  noteSharesTable,
  noteTemplatesTable,
  // Crypto
  cryptoPlatformsTable,
  cryptoHoldingsTable,
  cryptoTransactionsTable,
  cryptoWatchlistTable,
  // Registration
  partnerKeysTable,
  verifiedEmailsTable,
  // Connections
  externalConnectionsTable,
];

/**
 * Tables that only exist in Lovable Cloud
 * These are NOT synced to external datasources
 */
export const LOVABLE_ONLY_TABLES: TableDefinition[] = [
  systemConnectionTable,
];

/**
 * Complete OneApp Schema Definition
 */
export const ONEAPP_SCHEMA: SchemaDefinition = {
  version: ONEAPP_SCHEMA_VERSION,
  tables: [...CORE_TABLES, ...LOVABLE_ONLY_TABLES],
};

/**
 * Get schema for external datasources (excludes Lovable-only tables)
 */
export const getExternalSchema = (): SchemaDefinition => ({
  version: ONEAPP_SCHEMA_VERSION,
  tables: CORE_TABLES,
});

/**
 * Get table definition by name
 */
export const getTableDefinition = (tableName: string): TableDefinition | undefined => {
  return ONEAPP_SCHEMA.tables.find(t => t.name === tableName);
};

/**
 * Check if a table is Lovable-only
 */
export const isLovableOnlyTable = (tableName: string): boolean => {
  return LOVABLE_ONLY_TABLES.some(t => t.name === tableName);
};

/**
 * Get role level (lower = higher privilege)
 */
export const getRoleLevel = (role: OneAppRole): number => {
  return ROLE_LEVELS[role] || 4;
};

/**
 * Check if role1 has higher or equal privilege than role2
 */
export const hasHigherOrEqualPrivilege = (role1: OneAppRole, role2: OneAppRole): boolean => {
  return getRoleLevel(role1) <= getRoleLevel(role2);
};
