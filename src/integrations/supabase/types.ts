export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          name: string
          points_reward: number | null
          requirement_value: number | null
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          name: string
          points_reward?: number | null
          requirement_value?: number | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number | null
          requirement_value?: number | null
          type?: string
        }
        Relationships: []
      }
      app_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_admin: boolean
          session_token: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_admin?: boolean
          session_token: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_admin?: boolean
          session_token?: string
          unit_id?: string | null
        }
        Relationships: []
      }
      challenge_participations: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          points_earned: number | null
          proof: string | null
          status: string
          submitted_at: string
          unit_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          proof?: string | null
          status?: string
          submitted_at?: string
          unit_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          points_earned?: number | null
          proof?: string | null
          status?: string
          submitted_at?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participations_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          points_reward: number
          start_date: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          points_reward: number
          start_date: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          points_reward?: number
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      form_settings: {
        Row: {
          enabled_units: string[] | null
          form_type: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          enabled_units?: string[] | null
          form_type: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          enabled_units?: string[] | null
          form_type?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      gamification_notifications: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          message: string
          read_status: boolean | null
          title: string
          type: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          message: string
          read_status?: boolean | null
          title: string
          type: string
          unit_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          message?: string
          read_status?: boolean | null
          title?: string
          type?: string
          unit_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          badge_reward: string | null
          created_at: string
          description: string
          id: string
          points_reward: number
          status: string
          target_period: number | null
          target_value: number
          title: string
          type: string
        }
        Insert: {
          badge_reward?: string | null
          created_at?: string
          description: string
          id?: string
          points_reward: number
          status?: string
          target_period?: number | null
          target_value: number
          title: string
          type: string
        }
        Update: {
          badge_reward?: string | null
          created_at?: string
          description?: string
          id?: string
          points_reward?: number
          status?: string
          target_period?: number | null
          target_value?: number
          title?: string
          type?: string
        }
        Relationships: []
      }
      news_feed: {
        Row: {
          author_type: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_type?: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          id: string
          option_id: string
          poll_id: string | null
          unit_id: string
          voted_at: string
        }
        Insert: {
          id?: string
          option_id: string
          poll_id?: string | null
          unit_id: string
          voted_at?: string
        }
        Update: {
          id?: string
          option_id?: string
          poll_id?: string | null
          unit_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple_votes: boolean | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          options: Json
          status: string | null
          title: string
        }
        Insert: {
          allow_multiple_votes?: boolean | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          options: Json
          status?: string | null
          title: string
        }
        Update: {
          allow_multiple_votes?: boolean | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          options?: Json
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          unit_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          unit_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          unit_id?: string | null
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          id: string
          proof: string
          status: string | null
          submitted_at: string | null
          task_id: string | null
          unit_id: string | null
        }
        Insert: {
          id?: string
          proof: string
          status?: string | null
          submitted_at?: string | null
          task_id?: string | null
          unit_id?: string | null
        }
        Update: {
          id?: string
          proof?: string
          status?: string | null
          submitted_at?: string | null
          task_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string | null
          deadline: string
          description: string | null
          difficulty: string | null
          id: string
          points: number
          status: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          deadline: string
          description?: string | null
          difficulty?: string | null
          id?: string
          points: number
          status?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          deadline?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          points?: number
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      unit_achievements: {
        Row: {
          achievement_id: string
          completed_at: string
          id: string
          points_earned: number | null
          unit_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string
          id?: string
          points_earned?: number | null
          unit_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string
          id?: string
          points_earned?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_info: {
        Row: {
          counselors: Json | null
          created_at: string
          id: string
          pathfinders: Json | null
          unit_id: string
          unit_motto: string | null
          updated_at: string
        }
        Insert: {
          counselors?: Json | null
          created_at?: string
          id?: string
          pathfinders?: Json | null
          unit_id: string
          unit_motto?: string | null
          updated_at?: string
        }
        Update: {
          counselors?: Json | null
          created_at?: string
          id?: string
          pathfinders?: Json | null
          unit_id?: string
          unit_motto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_info_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: true
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_missions: {
        Row: {
          completed_at: string | null
          current_value: number | null
          id: string
          mission_id: string
          points_earned: number | null
          started_at: string
          status: string
          unit_id: string
        }
        Insert: {
          completed_at?: string | null
          current_value?: number | null
          id?: string
          mission_id: string
          points_earned?: number | null
          started_at?: string
          status?: string
          unit_id: string
        }
        Update: {
          completed_at?: string | null
          current_value?: number | null
          id?: string
          mission_id?: string
          points_earned?: number | null
          started_at?: string
          status?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string | null
          id: string
          logo: string | null
          name: string
          password: string
          score: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo?: string | null
          name: string
          password: string
          score?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo?: string | null
          name?: string
          password?: string
          score?: number | null
        }
        Relationships: []
      }
      weekly_attendances: {
        Row: {
          bible_option: string | null
          brought_bible: boolean | null
          brought_flag: boolean | null
          date: string
          id: string
          neckerchief_count: number | null
          photo_url: string | null
          present_members: string[] | null
          punctual_count: number | null
          score: number | null
          status: string | null
          submitted_at: string | null
          uniform_count: number | null
          unit_id: string | null
        }
        Insert: {
          bible_option?: string | null
          brought_bible?: boolean | null
          brought_flag?: boolean | null
          date: string
          id?: string
          neckerchief_count?: number | null
          photo_url?: string | null
          present_members?: string[] | null
          punctual_count?: number | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          uniform_count?: number | null
          unit_id?: string | null
        }
        Update: {
          bible_option?: string | null
          brought_bible?: boolean | null
          brought_flag?: boolean | null
          date?: string
          id?: string
          neckerchief_count?: number | null
          photo_url?: string | null
          present_members?: string[] | null
          punctual_count?: number | null
          score?: number | null
          status?: string | null
          submitted_at?: string | null
          uniform_count?: number | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_attendances_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_session: {
        Args: { p_session_token: string }
        Returns: string
      }
      create_new_unit: {
        Args: { name_param: string; password_param: string }
        Returns: string
      }
      create_unit_session: {
        Args: { p_unit_id: string; p_session_token: string }
        Returns: string
      }
      delete_session: {
        Args: { p_session_token: string }
        Returns: boolean
      }
      delete_unit: {
        Args: { unit_id_param: string }
        Returns: boolean
      }
      get_current_unit_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_form_enabled_for_unit: {
        Args: { form_name: string; unit_id: string }
        Returns: boolean
      }
      update_unit_password: {
        Args: { unit_id_param: string; new_password_param: string }
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
