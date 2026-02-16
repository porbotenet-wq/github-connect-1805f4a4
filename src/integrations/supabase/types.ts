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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_objects: {
        Row: {
          contract_date: string | null
          contract_link: string
          contractor_name: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_contacts: string | null
          customer_name: string | null
          duration_days: number | null
          end_date: string | null
          estimate_link: string
          id: string
          name: string
          project_id: string
          project_manager: string
          start_date: string | null
          status: string
          total_volume_m2: number | null
          updated_at: string
          work_types: string[] | null
        }
        Insert: {
          contract_date?: string | null
          contract_link?: string
          contractor_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_contacts?: string | null
          customer_name?: string | null
          duration_days?: number | null
          end_date?: string | null
          estimate_link?: string
          id?: string
          name: string
          project_id: string
          project_manager?: string
          start_date?: string | null
          status?: string
          total_volume_m2?: number | null
          updated_at?: string
          work_types?: string[] | null
        }
        Update: {
          contract_date?: string | null
          contract_link?: string
          contractor_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_contacts?: string | null
          customer_name?: string | null
          duration_days?: number | null
          end_date?: string | null
          estimate_link?: string
          id?: string
          name?: string
          project_id?: string
          project_manager?: string
          start_date?: string | null
          status?: string
          total_volume_m2?: number | null
          updated_at?: string
          work_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "construction_objects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_objects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_tasks: {
        Row: {
          assigned_user_id: string | null
          block: string
          bot_trigger: string | null
          code: string
          completed_at: string | null
          created_at: string
          department: string
          dependency_ids: string | null
          duration_days: number | null
          id: string
          incoming_doc: string | null
          notification_type: string | null
          object_id: string
          outgoing_doc: string | null
          planned_date: string | null
          priority: string
          recipient: string | null
          responsible: string | null
          status: string
          task_name: string
          task_number: number
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          block?: string
          bot_trigger?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          department?: string
          dependency_ids?: string | null
          duration_days?: number | null
          id?: string
          incoming_doc?: string | null
          notification_type?: string | null
          object_id: string
          outgoing_doc?: string | null
          planned_date?: string | null
          priority?: string
          recipient?: string | null
          responsible?: string | null
          status?: string
          task_name: string
          task_number: number
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          block?: string
          bot_trigger?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          department?: string
          dependency_ids?: string | null
          duration_days?: number | null
          id?: string
          incoming_doc?: string | null
          notification_type?: string | null
          object_id?: string
          outgoing_doc?: string | null
          planned_date?: string | null
          priority?: string
          recipient?: string | null
          responsible?: string | null
          status?: string
          task_name?: string
          task_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_tasks_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      facades: {
        Row: {
          brackets_fact: number | null
          brackets_plan: number | null
          created_at: string
          id: string
          modules_fact: number | null
          modules_plan: number | null
          name: string
          object_id: string
          sort_order: number | null
          status: string
        }
        Insert: {
          brackets_fact?: number | null
          brackets_plan?: number | null
          created_at?: string
          id?: string
          modules_fact?: number | null
          modules_plan?: number | null
          name: string
          object_id: string
          sort_order?: number | null
          status?: string
        }
        Update: {
          brackets_fact?: number | null
          brackets_plan?: number | null
          created_at?: string
          id?: string
          modules_fact?: number | null
          modules_plan?: number | null
          name?: string
          object_id?: string
          sort_order?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "facades_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_schemas: {
        Row: {
          cells: Json | null
          created_at: string
          elevation: string | null
          facade_id: string
          floor_number: number
          id: string
          updated_at: string
        }
        Insert: {
          cells?: Json | null
          created_at?: string
          elevation?: string | null
          facade_id: string
          floor_number: number
          id?: string
          updated_at?: string
        }
        Update: {
          cells?: Json | null
          created_at?: string
          elevation?: string | null
          facade_id?: string
          floor_number?: number
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_schemas_facade_id_fkey"
            columns: ["facade_id"]
            isOneToOne: false
            referencedRelation: "facades"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_snapshots: {
        Row: {
          created_at: string
          deviation: number | null
          id: string
          indicator_name: string
          object_id: string
          percent_done: number | null
          snapshot_date: string
          unit: string | null
          value_fact: number | null
          value_plan: number | null
        }
        Insert: {
          created_at?: string
          deviation?: number | null
          id?: string
          indicator_name: string
          object_id: string
          percent_done?: number | null
          snapshot_date?: string
          unit?: string | null
          value_fact?: number | null
          value_plan?: number | null
        }
        Update: {
          created_at?: string
          deviation?: number | null
          id?: string
          indicator_name?: string
          object_id?: string
          percent_done?: number | null
          snapshot_date?: string
          unit?: string | null
          value_fact?: number | null
          value_plan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_snapshots_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_fact_daily: {
        Row: {
          brackets_fact: number | null
          brackets_plan: number | null
          created_at: string
          day_number: number | null
          hermetic_fact: number | null
          hermetic_plan: number | null
          id: string
          modules_fact: number | null
          modules_plan: number | null
          notes: string | null
          object_id: string
          report_date: string
          sealant_fact: number | null
          sealant_plan: number | null
          week: string | null
        }
        Insert: {
          brackets_fact?: number | null
          brackets_plan?: number | null
          created_at?: string
          day_number?: number | null
          hermetic_fact?: number | null
          hermetic_plan?: number | null
          id?: string
          modules_fact?: number | null
          modules_plan?: number | null
          notes?: string | null
          object_id: string
          report_date: string
          sealant_fact?: number | null
          sealant_plan?: number | null
          week?: string | null
        }
        Update: {
          brackets_fact?: number | null
          brackets_plan?: number | null
          created_at?: string
          day_number?: number | null
          hermetic_fact?: number | null
          hermetic_plan?: number | null
          id?: string
          modules_fact?: number | null
          modules_plan?: number | null
          notes?: string | null
          object_id?: string
          report_date?: string
          sealant_fact?: number | null
          sealant_plan?: number | null
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_fact_daily_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tech_inspections: {
        Row: {
          accepted_count: number | null
          created_at: string
          id: string
          object_id: string
          pending_count: number | null
          stage_name: string
          total_count: number | null
          updated_at: string
        }
        Insert: {
          accepted_count?: number | null
          created_at?: string
          id?: string
          object_id: string
          pending_count?: number | null
          stage_name: string
          total_count?: number | null
          updated_at?: string
        }
        Update: {
          accepted_count?: number | null
          created_at?: string
          id?: string
          object_id?: string
          pending_count?: number | null
          stage_name?: string
          total_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tech_inspections_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          department: string | null
          full_name: string
          id: string
          project_id: string | null
          role: string
          status: string
          telegram_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          project_id?: string | null
          role?: string
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          project_id?: string | null
          role?: string
          status?: string
          telegram_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      work_schedule_items: {
        Row: {
          created_at: string
          duration_days: number | null
          end_date: string | null
          id: string
          notes: string | null
          object_id: string
          section: string
          sort_order: number
          start_date: string | null
          status: string
          subsection: string | null
          unit: string | null
          updated_at: string
          volume_fact: number | null
          volume_plan: number | null
          work_name: string
          workers_count: number | null
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          object_id: string
          section?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          subsection?: string | null
          unit?: string | null
          updated_at?: string
          volume_fact?: number | null
          volume_plan?: number | null
          work_name: string
          workers_count?: number | null
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          object_id?: string
          section?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          subsection?: string | null
          unit?: string | null
          updated_at?: string
          volume_fact?: number | null
          volume_plan?: number | null
          work_name?: string
          workers_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_schedule_items_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "construction_objects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
