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
      pricing_parameters: {
        Row: {
          created_at: string
          id: string
          margin_percentage: number
          multiplier_high: number
          multiplier_low: number
          multiplier_medium: number
          overhead_percentage: number
          rate_analyst: number
          rate_consultant: number
          rate_coordinator: number
          rate_senior_manager: number
          rate_trainer: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          margin_percentage?: number
          multiplier_high?: number
          multiplier_low?: number
          multiplier_medium?: number
          overhead_percentage?: number
          rate_analyst?: number
          rate_consultant?: number
          rate_coordinator?: number
          rate_senior_manager?: number
          rate_trainer?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          margin_percentage?: number
          multiplier_high?: number
          multiplier_low?: number
          multiplier_medium?: number
          overhead_percentage?: number
          rate_analyst?: number
          rate_consultant?: number
          rate_coordinator?: number
          rate_senior_manager?: number
          rate_trainer?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_services: {
        Row: {
          complexity: string
          coverage_duration: string | null
          created_at: string
          deliverable_formats: string[] | null
          deliverables: string[]
          display_order: number
          duration_unit: string
          estimated_duration: number
          event_date: string | null
          event_days: number | null
          event_extras: Json | null
          event_staffing: Json | null
          event_type: string | null
          has_crm_integration: boolean | null
          has_erp_integration: boolean | null
          has_maintenance: boolean | null
          has_payment_integration: boolean | null
          id: string
          includes_brand_guidelines: boolean | null
          maintenance_months: number | null
          number_of_concepts: number | null
          number_of_modules: number | null
          number_of_pages: number | null
          number_of_revisions: number | null
          post_production_hours: number | null
          proposal_id: string
          service_type: string
          service_value: number
          updated_at: string
          web_project_type: string | null
        }
        Insert: {
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          display_order?: number
          duration_unit?: string
          estimated_duration?: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          maintenance_months?: number | null
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          proposal_id: string
          service_type: string
          service_value?: number
          updated_at?: string
          web_project_type?: string | null
        }
        Update: {
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          display_order?: number
          duration_unit?: string
          estimated_duration?: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          maintenance_months?: number | null
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          proposal_id?: string
          service_type?: string
          service_value?: number
          updated_at?: string
          web_project_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          change_summary: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_type: string
          complexity: string
          coverage_duration: string | null
          created_at: string
          created_by: string
          deliverable_formats: string[] | null
          deliverables: string[]
          duration_months: number
          event_date: string | null
          event_days: number | null
          event_extras: Json | null
          event_staffing: Json | null
          event_type: string | null
          has_crm_integration: boolean | null
          has_erp_integration: boolean | null
          has_existing_team: boolean
          has_maintenance: boolean | null
          has_payment_integration: boolean | null
          id: string
          includes_brand_guidelines: boolean | null
          locations: string[]
          maintenance_months: number | null
          maturity_level: string
          methodology: string
          number_of_concepts: number | null
          number_of_modules: number | null
          number_of_pages: number | null
          number_of_revisions: number | null
          post_production_hours: number | null
          pricing_params: Json | null
          proposal_id: string
          sector: string
          service_type: string
          status: string
          total_value: number
          version_number: number
          web_project_type: string | null
        }
        Insert: {
          change_summary?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_type: string
          complexity: string
          coverage_duration?: string | null
          created_at?: string
          created_by: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          duration_months: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_existing_team?: boolean
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          locations?: string[]
          maintenance_months?: number | null
          maturity_level: string
          methodology: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          pricing_params?: Json | null
          proposal_id: string
          sector: string
          service_type: string
          status: string
          total_value: number
          version_number: number
          web_project_type?: string | null
        }
        Update: {
          change_summary?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: string
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          created_by?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          duration_months?: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_existing_team?: boolean
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          locations?: string[]
          maintenance_months?: number | null
          maturity_level?: string
          methodology?: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          pricing_params?: Json | null
          proposal_id?: string
          sector?: string
          service_type?: string
          status?: string
          total_value?: number
          version_number?: number
          web_project_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          challenges: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_type: string
          complexity: string
          coverage_duration: string | null
          created_at: string
          deliverable_formats: string[] | null
          deliverables: string[]
          duration_months: number
          event_date: string | null
          event_days: number | null
          event_extras: Json | null
          event_staffing: Json | null
          event_type: string | null
          has_crm_integration: boolean | null
          has_erp_integration: boolean | null
          has_existing_team: boolean
          has_maintenance: boolean | null
          has_payment_integration: boolean | null
          id: string
          includes_brand_guidelines: boolean | null
          locations: string[]
          maintenance_months: number | null
          maturity_level: string
          methodology: string
          number_of_concepts: number | null
          number_of_modules: number | null
          number_of_pages: number | null
          number_of_revisions: number | null
          objectives: string | null
          post_production_hours: number | null
          pricing_params: Json | null
          sector: string
          service_type: string
          status: string
          total_value: number
          updated_at: string
          user_id: string
          web_project_type: string | null
        }
        Insert: {
          challenges?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_type: string
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          duration_months: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_existing_team?: boolean
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          locations?: string[]
          maintenance_months?: number | null
          maturity_level?: string
          methodology?: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          objectives?: string | null
          post_production_hours?: number | null
          pricing_params?: Json | null
          sector: string
          service_type: string
          status?: string
          total_value: number
          updated_at?: string
          user_id: string
          web_project_type?: string | null
        }
        Update: {
          challenges?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_type?: string
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          duration_months?: number
          event_date?: string | null
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_existing_team?: boolean
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          locations?: string[]
          maintenance_months?: number | null
          maturity_level?: string
          methodology?: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          objectives?: string | null
          post_production_hours?: number | null
          pricing_params?: Json | null
          sector?: string
          service_type?: string
          status?: string
          total_value?: number
          updated_at?: string
          user_id?: string
          web_project_type?: string | null
        }
        Relationships: []
      }
      service_templates: {
        Row: {
          complexity: string
          coverage_duration: string | null
          created_at: string
          deliverable_formats: string[] | null
          deliverables: string[]
          description: string | null
          duration_unit: string
          estimated_duration: number
          event_days: number | null
          event_extras: Json | null
          event_staffing: Json | null
          event_type: string | null
          has_crm_integration: boolean | null
          has_erp_integration: boolean | null
          has_maintenance: boolean | null
          has_payment_integration: boolean | null
          id: string
          includes_brand_guidelines: boolean | null
          is_system_template: boolean
          maintenance_months: number | null
          name: string
          number_of_concepts: number | null
          number_of_modules: number | null
          number_of_pages: number | null
          number_of_revisions: number | null
          post_production_hours: number | null
          service_type: string
          updated_at: string
          user_id: string | null
          web_project_type: string | null
        }
        Insert: {
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          description?: string | null
          duration_unit?: string
          estimated_duration?: number
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          is_system_template?: boolean
          maintenance_months?: number | null
          name: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          service_type: string
          updated_at?: string
          user_id?: string | null
          web_project_type?: string | null
        }
        Update: {
          complexity?: string
          coverage_duration?: string | null
          created_at?: string
          deliverable_formats?: string[] | null
          deliverables?: string[]
          description?: string | null
          duration_unit?: string
          estimated_duration?: number
          event_days?: number | null
          event_extras?: Json | null
          event_staffing?: Json | null
          event_type?: string | null
          has_crm_integration?: boolean | null
          has_erp_integration?: boolean | null
          has_maintenance?: boolean | null
          has_payment_integration?: boolean | null
          id?: string
          includes_brand_guidelines?: boolean | null
          is_system_template?: boolean
          maintenance_months?: number | null
          name?: string
          number_of_concepts?: number | null
          number_of_modules?: number | null
          number_of_pages?: number | null
          number_of_revisions?: number | null
          post_production_hours?: number | null
          service_type?: string
          updated_at?: string
          user_id?: string | null
          web_project_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "comercial"
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
      app_role: ["admin", "gestor", "comercial"],
    },
  },
} as const
