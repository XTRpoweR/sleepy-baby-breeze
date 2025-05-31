export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      baby_activities: {
        Row: {
          activity_type: string
          baby_id: string
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          metadata: Json | null
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          activity_type: string
          baby_id: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          activity_type?: string
          baby_id?: string
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          start_time?: string
          updated_at?: string
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
      baby_profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          baby_id: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          permissions: Json | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          baby_id: string
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          baby_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string | null
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sleep_schedules: {
        Row: {
          baby_id: string
          child_age: number
          created_at: string
          current_bedtime: string
          current_wake_time: string
          id: string
          nap_frequency: string
          recommended_bedtime: string
          recommended_naps: Json
          recommended_wake_time: string
          sleep_challenges: string[] | null
          total_sleep_hours: number
          updated_at: string
        }
        Insert: {
          baby_id: string
          child_age: number
          created_at?: string
          current_bedtime: string
          current_wake_time: string
          id?: string
          nap_frequency: string
          recommended_bedtime: string
          recommended_naps?: Json
          recommended_wake_time: string
          sleep_challenges?: string[] | null
          total_sleep_hours: number
          updated_at?: string
        }
        Update: {
          baby_id?: string
          child_age?: number
          created_at?: string
          current_bedtime?: string
          current_wake_time?: string
          id?: string
          nap_frequency?: string
          recommended_bedtime?: string
          recommended_naps?: Json
          recommended_wake_time?: string
          sleep_challenges?: string[] | null
          total_sleep_hours?: number
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_baby_access: {
        Args: { check_user_id: string; check_baby_id: string }
        Returns: boolean
      }
      is_baby_owner: {
        Args: { check_user_id: string; check_baby_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
