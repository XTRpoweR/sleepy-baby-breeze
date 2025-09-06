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
          status: string
          subscribed_at: string
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribe_token?: string
          updated_at?: string
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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
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
      subscriptions: {
        Row: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      get_user_subscription_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_premium_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_baby_owner: {
        Args: { baby_uuid: string; user_uuid: string }
        Returns: boolean
      }
      safe_newsletter_unsubscribe: {
        Args: { token_param: string }
        Returns: boolean
      }
      set_active_profile: {
        Args: { profile_id: string; user_id_param: string }
        Returns: undefined
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
