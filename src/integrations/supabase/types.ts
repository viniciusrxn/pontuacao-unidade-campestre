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
      form_settings: {
        Row: {
          enabled_units: string[] | null
          form_type: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          enabled_units?: string[] | null
          form_type: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          enabled_units?: string[] | null
          form_type?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_type: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_type?: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_type?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_credentials: {
        Row: {
          id: string
          username: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          id: string
          task_id: string
          unit_id: string
          proof: string
          status: string
          admin_feedback: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          task_id: string
          unit_id: string
          proof: string
          status?: string
          admin_feedback?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          unit_id?: string
          proof?: string
          status?: string
          admin_feedback?: string | null
          submitted_at?: string
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
          id: string
          title: string
          description: string | null
          points: number
          deadline: string
          difficulty: string
          category: string
          target_units: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points: number
          deadline: string
          difficulty?: string
          category?: string
          target_units?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points?: number
          deadline?: string
          difficulty?: string
          category?: string
          target_units?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_info: {
        Row: {
          counselors: string[] | null
          id: string
          pathfinders: string[] | null
          unit_id: string
          unit_motto: string | null
          updated_at: string
        }
        Insert: {
          counselors?: string[] | null
          id?: string
          pathfinders?: string[] | null
          unit_id: string
          unit_motto?: string | null
          updated_at?: string
        }
        Update: {
          counselors?: string[] | null
          id?: string
          pathfinders?: string[] | null
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
      score_history: {
        Row: {
          id: string
          unit_id: string
          score: number
          change_amount: number
          reason: string
          recorded_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          score: number
          change_amount?: number
          reason?: string
          recorded_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          score?: number
          change_amount?: number
          reason?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_history_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          id: string
          name: string
          logo: string | null
          password: string
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo?: string | null
          name: string
          password: string
          score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          password?: string
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      weekly_attendances: {
        Row: {
          id: string
          unit_id: string
          date: string
          present_members: string[] | null
          punctual_count: number
          neckerchief_count: number
          uniform_count: number
          brought_flag: boolean
          brought_bible: boolean
          photo_url: string | null
          score: number
          status: string
          admin_feedback: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          date: string
          present_members?: string[] | null
          punctual_count?: number
          neckerchief_count?: number
          uniform_count?: number
          brought_flag?: boolean
          brought_bible?: boolean
          photo_url?: string | null
          score?: number
          status?: string
          admin_feedback?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          date?: string
          present_members?: string[] | null
          punctual_count?: number
          neckerchief_count?: number
          uniform_count?: number
          brought_flag?: boolean
          brought_bible?: boolean
          photo_url?: string | null
          score?: number
          status?: string
          admin_feedback?: string | null
          submitted_at?: string
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
      authenticate_admin: {
        Args: { password_param: string; username_param: string }
        Returns: Json
      }
      authenticate_unit: {
        Args: { password_param: string; unit_name_param: string }
        Returns: Json
      }
      create_new_unit: {
        Args: { name_param: string; password_param: string }
        Returns: string
      }
      delete_unit: { Args: { unit_id_param: string }; Returns: boolean }
      get_system_stats: { Args: never; Returns: Json }
      is_form_enabled_for_unit: {
        Args: { form_name: string; unit_id_param: string }
        Returns: boolean
      }
      update_unit_password: {
        Args: { new_password_param: string; unit_id_param: string }
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
