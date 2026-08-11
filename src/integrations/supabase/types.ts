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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      customer_measurements: {
        Row: {
          arm_cm: number | null
          chest_cm: number | null
          created_at: string | null
          customer_id: string
          hip_cm: number | null
          id: string
          taken_on: string
          thigh_cm: number | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string | null
          customer_id: string
          hip_cm?: number | null
          id?: string
          taken_on?: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string | null
          customer_id?: string
          hip_cm?: number | null
          id?: string
          taken_on?: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_measurements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          fbo_id: string
          gender: string | null
          goal_weight_kg: number | null
          health_consent_at: string | null
          height_cm: number | null
          id: string
          name: string
          phone: string | null
          referred_by_customer_id: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          fbo_id: string
          gender?: string | null
          goal_weight_kg?: number | null
          health_consent_at?: string | null
          height_cm?: number | null
          id?: string
          name: string
          phone?: string | null
          referred_by_customer_id?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          fbo_id?: string
          gender?: string | null
          goal_weight_kg?: number | null
          health_consent_at?: string | null
          height_cm?: number | null
          id?: string
          name?: string
          phone?: string | null
          referred_by_customer_id?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_referred_by_customer_id_fkey"
            columns: ["referred_by_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          day_number: number
          enrollment_id: string
          id: string
          log_date: string
          mood: string | null
          notes: string | null
          water_ml: number
        }
        Insert: {
          created_at?: string
          day_number: number
          enrollment_id: string
          id?: string
          log_date: string
          mood?: string | null
          notes?: string | null
          water_ml?: number
        }
        Update: {
          created_at?: string
          day_number?: number
          enrollment_id?: string
          id?: string
          log_date?: string
          mood?: string | null
          notes?: string | null
          water_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      day_tasks: {
        Row: {
          dosage: string | null
          id: string
          instructions: string | null
          is_optional: boolean
          product_id: string | null
          program_day_id: string
          sort_order: number
          suggested_time: string | null
          time_slot: string
          title: string
        }
        Insert: {
          dosage?: string | null
          id?: string
          instructions?: string | null
          is_optional?: boolean
          product_id?: string | null
          program_day_id: string
          sort_order?: number
          suggested_time?: string | null
          time_slot: string
          title: string
        }
        Update: {
          dosage?: string | null
          id?: string
          instructions?: string | null
          is_optional?: boolean
          product_id?: string | null
          program_day_id?: string
          sort_order?: number
          suggested_time?: string | null
          time_slot?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_tasks_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string
          id: string
          program_id: string
          start_date: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          program_id: string
          start_date: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          program_id?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category?: string | null
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string | null
          id?: string
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      measurements: {
        Row: {
          arm_cm: number | null
          chest_cm: number | null
          created_at: string
          customer_id: string
          hip_cm: number | null
          id: string
          taken_on: string
          thigh_cm: number | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          customer_id: string
          hip_cm?: number | null
          id?: string
          taken_on: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          chest_cm?: number | null
          created_at?: string
          customer_id?: string
          hip_cm?: number | null
          id?: string
          taken_on?: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          code: string
          common_mistakes: string | null
          how_to_use: string | null
          id: string
          image_url: string | null
          name: string
          short_desc: string | null
          sort_order: number
          video_url: string | null
          why_in_program: string | null
        }
        Insert: {
          code: string
          common_mistakes?: string | null
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          name: string
          short_desc?: string | null
          sort_order?: number
          video_url?: string | null
          why_in_program?: string | null
        }
        Update: {
          code?: string
          common_mistakes?: string | null
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          name?: string
          short_desc?: string | null
          sort_order?: number
          video_url?: string | null
          why_in_program?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          day_number: number
          focus: string | null
          id: string
          meal_guidance: string | null
          motivation: string | null
          program_id: string
          tip: string | null
          title: string
        }
        Insert: {
          day_number: number
          focus?: string | null
          id?: string
          meal_guidance?: string | null
          motivation?: string | null
          program_id: string
          tip?: string | null
          title: string
        }
        Update: {
          day_number?: number
          focus?: string | null
          id?: string
          meal_guidance?: string | null
          motivation?: string | null
          program_id?: string
          tip?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_products: {
        Row: {
          product_id: string
          program_id: string
          quantity: string | null
          sort_order: number
        }
        Insert: {
          product_id: string
          program_id: string
          quantity?: string | null
          sort_order?: number
        }
        Update: {
          product_id?: string
          program_id?: string
          quantity?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "program_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_products_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          code: string
          description: string | null
          duration_days: number
          hero_image_url: string | null
          id: string
          is_active: boolean
          name: string
          next_program_code: string | null
          sort_order: number
          subtitle: string | null
        }
        Insert: {
          code: string
          description?: string | null
          duration_days: number
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          next_program_code?: string | null
          sort_order?: number
          subtitle?: string | null
        }
        Update: {
          code?: string
          description?: string | null
          duration_days?: number
          hero_image_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          next_program_code?: string | null
          sort_order?: number
          subtitle?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          pose: string
          share_consent: boolean
          storage_path: string
          taken_on: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          pose?: string
          share_consent?: boolean
          storage_path: string
          taken_on: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          pose?: string
          share_consent?: boolean
          storage_path?: string
          taken_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          lead_name: string | null
          lead_phone: string | null
          referrer_customer_id: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_name?: string | null
          lead_phone?: string | null
          referrer_customer_id?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_name?: string | null
          lead_phone?: string | null
          referrer_customer_id?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_customer_id_fkey"
            columns: ["referrer_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          completed_at: string
          daily_log_id: string
          day_task_id: string
          id: string
        }
        Insert: {
          completed_at?: string
          daily_log_id: string
          day_task_id: string
          id?: string
        }
        Update: {
          completed_at?: string
          daily_log_id?: string
          day_task_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_day_task_id_fkey"
            columns: ["day_task_id"]
            isOneToOne: false
            referencedRelation: "day_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_signup_credentials: {
        Row: {
          access_code: string
          created_at: string
          tenant_id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          tenant_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_signup_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          email: string | null
          features: Json
          id: string
          logo_url: string | null
          name: string
          owner_name: string | null
          phone: string | null
          primary_color: string
          secondary_color: string
          slug: string
          status: string
          tagline: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          name: string
          owner_name?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          slug: string
          status?: string
          tagline?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          name?: string
          owner_name?: string | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string
          slug?: string
          status?: string
          tagline?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          body: string
          category: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          body: string
          category: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          body?: string
          category?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      whatsapp_otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          delivery_status: string
          expires_at: string
          id: string
          meta_response: Json | null
          phone_number: string
          user_id: string | null
          verified: boolean
          whatsapp_message_id: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          delivery_status?: string
          expires_at: string
          id?: string
          meta_response?: Json | null
          phone_number: string
          user_id?: string | null
          verified?: boolean
          whatsapp_message_id?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          delivery_status?: string
          expires_at?: string
          id?: string
          meta_response?: Json | null
          phone_number?: string
          user_id?: string | null
          verified?: boolean
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_connected: boolean
          phone_number_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          phone_number_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_connected?: boolean
          phone_number_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_customer: {
        Args: { _customer: string; _uid: string }
        Returns: boolean
      }
      complete_onboarding: {
        Args: {
          _age: number
          _arm_cm?: number
          _chest_cm?: number
          _customer_id: string
          _gender: string
          _goal_weight_kg: number
          _height_cm: number
          _hip_cm?: number
          _name: string
          _program_id: string
          _start_date: string
          _thigh_cm?: number
          _waist_cm: number
          _weight_kg: number
        }
        Returns: undefined
      }
      current_customer_ids: { Args: { _uid: string }; Returns: string[] }
      get_ist_day_number: { Args: { _start_date: string }; Returns: number }
      get_my_auth_context: { Args: never; Returns: Json }
      get_program_day_with_tasks: {
        Args: { _date: string; _program_id: string; _start_date: string }
        Returns: Json
      }
      is_platform_admin: { Args: { _uid?: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant: string; _uid: string }
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
