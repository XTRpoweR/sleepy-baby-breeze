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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      baby_activities: {
        Row: {
          activity_type: string
          baby_id: string
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          notes: string | null
          start_time: string
        }
        Insert: {
          activity_type: string
          baby_id: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          start_time: string
        }
        Update: {
          activity_type?: string
          baby_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "baby_activities_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      baby_memories: {
        Row: {
          baby_id: string
          created_at: string
          description: string | null
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          mime_type: string | null
          taken_at: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          mime_type?: string | null
          taken_at?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          mime_type?: string | null
          taken_at?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      baby_profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
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
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          category: string | null
          created_at: string
          direction: string
          id: string
          message_body: string
          parent_message_id: string | null
          replied_by: string | null
          resend_email_id: string | null
          sender_email: string
          sender_name: string | null
          status: string
          subject: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          direction: string
          id?: string
          message_body: string
          parent_message_id?: string | null
          replied_by?: string | null
          resend_email_id?: string | null
          sender_email: string
          sender_name?: string | null
          status?: string
          subject?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_body?: string
          parent_message_id?: string | null
          replied_by?: string | null
          resend_email_id?: string | null
          sender_email?: string
          sender_name?: string | null
          status?: string
          subject?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invitations: {
        Row: {
          baby_id: string
          created_at: string
          email: string
          email_verified: boolean | null
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          permissions: Json | null
          role: string
          status: string
          updated_at: string
          verification_code: string | null
          verification_expires_at: string | null
        }
        Insert: {
          baby_id: string
          created_at?: string
          email: string
          email_verified?: boolean | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          verification_code?: string | null
          verification_expires_at?: string | null
        }
        Update: {
          baby_id?: string
          created_at?: string
          email?: string
          email_verified?: boolean | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          verification_code?: string | null
          verification_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          baby_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          role: string
          status: string
          user_id: string
        }
        Insert: {
          baby_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          baby_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          baby_id: string
          content: string | null
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          baby_id: string
          content?: string | null
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          baby_id?: string
          content?: string | null
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_events: {
        Row: {
          capi_error: string | null
          capi_response: Json | null
          capi_sent: boolean | null
          capi_sent_at: string | null
          client_user_agent: string | null
          content_category: string | null
          content_ids: string[] | null
          content_name: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          email_hash: string | null
          event_id: string | null
          event_name: string
          event_source: string | null
          external_id: string | null
          fbc: string | null
          fbclid: string | null
          fbp: string | null
          gclid: string | null
          id: string
          ip_address: unknown
          page_referrer: string | null
          page_url: string | null
          phone_hash: string | null
          raw_payload: Json | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          value: number | null
        }
        Insert: {
          capi_error?: string | null
          capi_response?: Json | null
          capi_sent?: boolean | null
          capi_sent_at?: string | null
          client_user_agent?: string | null
          content_category?: string | null
          content_ids?: string[] | null
          content_name?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          email_hash?: string | null
          event_id?: string | null
          event_name: string
          event_source?: string | null
          external_id?: string | null
          fbc?: string | null
          fbclid?: string | null
          fbp?: string | null
          gclid?: string | null
          id?: string
          ip_address?: unknown
          page_referrer?: string | null
          page_url?: string | null
          phone_hash?: string | null
          raw_payload?: Json | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Update: {
          capi_error?: string | null
          capi_response?: Json | null
          capi_sent?: boolean | null
          capi_sent_at?: string | null
          client_user_agent?: string | null
          content_category?: string | null
          content_ids?: string[] | null
          content_name?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          email_hash?: string | null
          event_id?: string | null
          event_name?: string
          event_source?: string | null
          external_id?: string | null
          fbc?: string | null
          fbclid?: string | null
          fbp?: string | null
          gclid?: string | null
          id?: string
          ip_address?: unknown
          page_referrer?: string | null
          page_url?: string | null
          phone_hash?: string | null
          raw_payload?: Json | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          value?: number | null
        }
        Relationships: []
      }
      message_participants: {
        Row: {
          created_at: string
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          language: string
          status: string
          subscribed_at: string
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          language?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          language?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          feeding_interval: number
          feeding_reminders: boolean
          id: string
          milestone_reminders: boolean
          notifications_enabled: boolean
          pattern_alerts: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          sleep_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feeding_interval?: number
          feeding_reminders?: boolean
          id?: string
          milestone_reminders?: boolean
          notifications_enabled?: boolean
          pattern_alerts?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sleep_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feeding_interval?: number
          feeding_reminders?: boolean
          id?: string
          milestone_reminders?: boolean
          notifications_enabled?: boolean
          pattern_alerts?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sleep_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          used_at: string | null
          verification_code: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          used_at?: string | null
          verification_code: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          verification_code?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          updated_at: string | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean
          updated_at?: string | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string | null
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          baby_id: string
          body: string
          created_at: string
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          baby_id: string
          body: string
          created_at?: string
          id?: string
          notification_type: string
          scheduled_for?: string
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          baby_id?: string
          body?: string
          created_at?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_description: string
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          severity: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_description: string
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_description?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sleep_schedules: {
        Row: {
          baby_id: string
          child_age: number
          created_at: string | null
          current_bedtime: string
          current_wake_time: string
          id: string
          nap_frequency: string
          recommended_bedtime: string
          recommended_naps: Json | null
          recommended_wake_time: string
          sleep_challenges: string[] | null
          total_sleep_hours: number
          updated_at: string | null
        }
        Insert: {
          baby_id: string
          child_age: number
          created_at?: string | null
          current_bedtime: string
          current_wake_time: string
          id?: string
          nap_frequency: string
          recommended_bedtime: string
          recommended_naps?: Json | null
          recommended_wake_time: string
          sleep_challenges?: string[] | null
          total_sleep_hours: number
          updated_at?: string | null
        }
        Update: {
          baby_id?: string
          child_age?: number
          created_at?: string | null
          current_bedtime?: string
          current_wake_time?: string
          id?: string
          nap_frequency?: string
          recommended_bedtime?: string
          recommended_naps?: Json | null
          recommended_wake_time?: string
          sleep_challenges?: string[] | null
          total_sleep_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sleep_schedules_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "baby_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_price_config: {
        Row: {
          active: boolean
          amount_cents: number
          created_at: string
          currency: string
          id: string
          interval: string
          interval_count: number
          plan_key: string
          stripe_price_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          interval: string
          interval_count?: number
          plan_key: string
          stripe_price_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          interval_count?: number
          plan_key?: string
          stripe_price_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          is_trial: boolean | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          is_trial?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          is_trial?: boolean | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_locations: {
        Row: {
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          last_ip: unknown
          region: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          last_ip?: unknown
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          last_ip?: unknown
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_queries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message_text?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean
          last_activity_at: string
          location_info: Json | null
          login_at: string
          session_id: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity_at?: string
          location_info?: Json | null
          login_at?: string
          session_id: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_activity_at?: string
          location_info?: Json | null
          login_at?: string
          session_id?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      marketing_funnel_summary: {
        Row: {
          avg_value: number | null
          event_count: number | null
          event_date: string | null
          event_name: string | null
          total_value: number | null
          unique_users: number | null
          utm_campaign: string | null
          utm_source: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_analytics: { Args: never; Returns: Json }
      admin_list_newsletter_subscribers: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          language: string
          status: string
          subscribed_at: string
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          baby_count: number
          city: string
          country: string
          country_code: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          last_active_at: string
          plan_label: string
          subscription_status: string
          subscription_tier: string
        }[]
      }
      admin_set_user_admin: {
        Args: { make_admin: boolean; target_user_id: string }
        Returns: undefined
      }
      can_access_baby: {
        Args: { baby_uuid: string; user_uuid: string }
        Returns: boolean
      }
      can_edit_baby_activities: {
        Args: { baby_uuid: string; user_uuid: string }
        Returns: boolean
      }
      cleanup_inconsistent_invitations: {
        Args: { baby_uuid: string }
        Returns: undefined
      }
      delete_baby_profile_completely: {
        Args: { profile_id: string; user_id_param: string }
        Returns: boolean
      }
      get_family_member_role: {
        Args: { baby_uuid: string; user_uuid: string }
        Returns: string
      }
      get_family_members_with_profiles: {
        Args: { baby_uuid: string }
        Returns: {
          baby_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          invited_at: string
          invited_by: string
          joined_at: string
          permissions: Json
          role: string
          status: string
          user_id: string
        }[]
      }
      get_invitation_by_token: {
        Args: { token_param: string }
        Returns: {
          baby_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          permissions: Json
          role: string
          status: string
        }[]
      }
      get_user_subscription_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_premium_access: { Args: { user_uuid: string }; Returns: boolean }
      invalidate_other_sessions: {
        Args: { current_session_id?: string; user_uuid: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      is_baby_owner: {
        Args: { baby_uuid: string; user_uuid: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          event_description: string
          event_type: string
          ip_address?: unknown
          metadata?: Json
          severity?: string
          user_agent?: string
          user_uuid: string
        }
        Returns: string
      }
      set_active_profile: {
        Args: { profile_id: string; user_id_param: string }
        Returns: undefined
      }
      track_marketing_event: {
        Args: {
          p_content_name?: string
          p_currency?: string
          p_email?: string
          p_event_name: string
          p_metadata?: Json
          p_user_id?: string
          p_value?: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
