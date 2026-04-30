export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_categories: {
        Row: {
          app_id: string
          category_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          app_id: string
          category_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          app_id?: string
          category_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_categories_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "in_use_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          icon_url: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string
          agent_name: string
          created_at: string
          id: string
          last_message: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          created_at?: string
          id?: string
          last_message?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          created_at?: string
          id?: string
          last_message?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crypto_holdings: {
        Row: {
          avg_buy_price: number
          coin_name: string
          coin_symbol: string
          created_at: string
          current_price: number | null
          id: string
          platform_id: string | null
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_buy_price?: number
          coin_name: string
          coin_symbol: string
          created_at?: string
          current_price?: number | null
          id?: string
          platform_id?: string | null
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_buy_price?: number
          coin_name?: string
          coin_symbol?: string
          created_at?: string
          current_price?: number | null
          id?: string
          platform_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_holdings_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "crypto_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_platforms: {
        Row: {
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string
          id: string
          is_connected: boolean
          last_synced_at: string | null
          platform_name: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_synced_at?: string | null
          platform_name: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          last_synced_at?: string | null
          platform_name?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          coin_symbol: string
          created_at: string
          currency: string
          id: string
          notes: string | null
          platform_id: string | null
          price_per_unit: number
          quantity: number
          total_value: number
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["crypto_transaction_type"]
          user_id: string
        }
        Insert: {
          coin_symbol: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          platform_id?: string | null
          price_per_unit: number
          quantity: number
          total_value: number
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["crypto_transaction_type"]
          user_id: string
        }
        Update: {
          coin_symbol?: string
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          platform_id?: string | null
          price_per_unit?: number
          quantity?: number
          total_value?: number
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["crypto_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "crypto_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_watchlist: {
        Row: {
          alert_price_above: number | null
          alert_price_below: number | null
          coin_name: string
          coin_symbol: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          alert_price_above?: number | null
          alert_price_below?: number | null
          coin_name: string
          coin_symbol: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          alert_price_above?: number | null
          alert_price_below?: number | null
          coin_name?: string
          coin_symbol?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      external_connections: {
        Row: {
          connection_status: string | null
          created_at: string | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_tested_at: string | null
          name: string
          supabase_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_status?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          name?: string
          supabase_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_status?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          name?: string
          supabase_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      in_use_apps: {
        Row: {
          app_image_url: string | null
          created_at: string
          icon_url: string | null
          id: string
          long_description: string | null
          name: string
          route: string
          short_description: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          app_image_url?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          long_description?: string | null
          name: string
          route: string
          short_description?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          app_image_url?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          long_description?: string | null
          name?: string
          route?: string
          short_description?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string
          icon_name: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      note_items: {
        Row: {
          content: string | null
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          note_id: string
          parent_item_id: string | null
          priority: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          note_id: string
          parent_item_id?: string | null
          priority?: string | null
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          note_id?: string
          parent_item_id?: string | null
          priority?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_items_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_reminders: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean
          note_id: string
          remind_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean
          note_id: string
          remind_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean
          note_id?: string
          remind_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_reminders_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          note_id: string
          share_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          note_id: string
          share_token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          note_id?: string
          share_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_shares_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tag_links: {
        Row: {
          id: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          id?: string
          note_id: string
          tag_id: string
          user_id: string
        }
        Update: {
          id?: string
          note_id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tag_links_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "note_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      note_templates: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_system: boolean
          name: string
          note_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_system?: boolean
          name: string
          note_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_system?: boolean
          name?: string
          note_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          folder_id: string | null
          id: string
          is_archived: boolean
          is_pinned: boolean
          note_type: string
          parent_id: string | null
          sort_order: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          note_type?: string
          parent_id?: string | null
          sort_order?: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          folder_id?: string | null
          id?: string
          is_archived?: boolean
          is_pinned?: boolean
          note_type?: string
          parent_id?: string | null
          sort_order?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      oneapp_users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string
          email_verified: boolean
          github_url: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          level: number
          linkedin_url: string | null
          lovable_user_id: string | null
          must_change_password: boolean
          nickname: string | null
          password_hash: string
          phone: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          email_verified?: boolean
          github_url?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          level?: number
          linkedin_url?: string | null
          lovable_user_id?: string | null
          must_change_password?: boolean
          nickname?: string | null
          password_hash: string
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          email_verified?: boolean
          github_url?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          level?: number
          linkedin_url?: string | null
          lovable_user_id?: string | null
          must_change_password?: boolean
          nickname?: string | null
          password_hash?: string
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      partner_keys: {
        Row: {
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_code: string
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_code: string
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_code?: string
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "oneapp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          nickname: string | null
          phone: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          nickname?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          nickname?: string | null
          phone?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          permission: string
          role: Database["public"]["Enums"]["oneapp_role"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          permission: string
          role: Database["public"]["Enums"]["oneapp_role"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["oneapp_role"]
        }
        Relationships: []
      }
      system_connection: {
        Row: {
          configured_by: string | null
          connection_status: string | null
          created_at: string | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_tested_at: string | null
          supabase_anon_key: string | null
          supabase_service_key: string | null
          supabase_url: string | null
          updated_at: string | null
        }
        Insert: {
          configured_by?: string | null
          connection_status?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          supabase_anon_key?: string | null
          supabase_service_key?: string | null
          supabase_url?: string | null
          updated_at?: string | null
        }
        Update: {
          configured_by?: string | null
          connection_status?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          supabase_anon_key?: string | null
          supabase_service_key?: string | null
          supabase_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          chatgpt_key: string | null
          claude_key: string | null
          created_at: string
          deepseek_key: string | null
          exa_key: string | null
          gemini_key: string | null
          github_key: string | null
          github_active_model: string | null
          grok_key: string | null
          groq_key: string | null
          id: string
          perplexity_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chatgpt_key?: string | null
          claude_key?: string | null
          created_at?: string
          deepseek_key?: string | null
          exa_key?: string | null
          gemini_key?: string | null
          github_key?: string | null
          github_active_model?: string | null
          grok_key?: string | null
          groq_key?: string | null
          id?: string
          perplexity_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chatgpt_key?: string | null
          claude_key?: string | null
          created_at?: string
          deepseek_key?: string | null
          exa_key?: string | null
          gemini_key?: string | null
          github_key?: string | null
          github_active_model?: string | null
          grok_key?: string | null
          groq_key?: string | null
          id?: string
          perplexity_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["oneapp_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["oneapp_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["oneapp_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "oneapp_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "oneapp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_used_at: string
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_used_at?: string
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_used_at?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "oneapp_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          custom_theme_colors: Json | null
          dashboard_settings: Json | null
          display_settings: Json | null
          header_settings: Json | null
          id: string
          layout_settings: Json | null
          sidebar_settings: Json | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_theme_colors?: Json | null
          dashboard_settings?: Json | null
          display_settings?: Json | null
          header_settings?: Json | null
          id?: string
          layout_settings?: Json | null
          sidebar_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_theme_colors?: Json | null
          dashboard_settings?: Json | null
          display_settings?: Json | null
          header_settings?: Json | null
          id?: string
          layout_settings?: Json | null
          sidebar_settings?: Json | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verified_emails: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          is_used: boolean
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verified_emails_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "oneapp_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_level: { Args: { _user_id: string }; Returns: number }
      has_higher_or_equal_level: {
        Args: { _target_level: number; _user_id: string }
        Returns: boolean
      }
      has_oneapp_role: {
        Args: {
          _role: Database["public"]["Enums"]["oneapp_role"]
          _user_id: string
        }
        Returns: boolean
      }
      seed_super_admin: { Args: never; Returns: undefined }
    }
    Enums: {
      app_status: "available" | "disable" | "developing"
      crypto_transaction_type: "buy" | "sell" | "transfer" | "receive"
      oneapp_role: "admin" | "developer" | "business_partner" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_status: ["available", "disable", "developing"],
      crypto_transaction_type: ["buy", "sell", "transfer", "receive"],
      oneapp_role: ["admin", "developer", "business_partner", "customer"],
    },
  },
} as const
