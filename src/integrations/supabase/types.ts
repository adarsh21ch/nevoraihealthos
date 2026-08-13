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
      access_codes: {
        Row: {
          coach_id: string | null
          code: string
          created_at: string
          customer_id: string | null
          expires_at: string | null
          id: string
          phone: string | null
          used_at: string | null
        }
        Insert: {
          coach_id?: string | null
          code: string
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          phone?: string | null
          used_at?: string | null
        }
        Update: {
          coach_id?: string | null
          code?: string
          created_at?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          phone?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generation_logs: {
        Row: {
          completion_tokens: number | null
          created_at: string | null
          distributor_id: string
          error_message: string | null
          generation_type: string
          id: string
          knowledge_version: string | null
          model: string
          participant_id: string
          prompt_tokens: number | null
          rule_version: string | null
          safety_flags: string[] | null
          status: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string | null
          distributor_id: string
          error_message?: string | null
          generation_type: string
          id?: string
          knowledge_version?: string | null
          model: string
          participant_id: string
          prompt_tokens?: number | null
          rule_version?: string | null
          safety_flags?: string[] | null
          status: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string | null
          distributor_id?: string
          error_message?: string | null
          generation_type?: string
          id?: string
          knowledge_version?: string | null
          model?: string
          participant_id?: string
          prompt_tokens?: number | null
          rule_version?: string | null
          safety_flags?: string[] | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      app_admins: {
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
      app_settings: {
        Row: {
          brand_name: string
          health_disclaimer: string
          id: boolean
          results_disclaimer: string
          tagline: string
          whatsapp_number: string
        }
        Insert: {
          brand_name?: string
          health_disclaimer?: string
          id?: boolean
          results_disclaimer?: string
          tagline?: string
          whatsapp_number?: string
        }
        Update: {
          brand_name?: string
          health_disclaimer?: string
          id?: boolean
          results_disclaimer?: string
          tagline?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          age: number | null
          completed_at: string | null
          created_at: string
          disclaimer_accepted_at: string | null
          distributor_id: string | null
          fbo_id: string | null
          gender: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          language: string | null
          name: string
          onboarding_complete: boolean
          phone: string | null
          program_id: string | null
          share_consent: boolean
          start_date: string | null
          track: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          completed_at?: string | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          distributor_id?: string | null
          fbo_id?: string | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string
          onboarding_complete?: boolean
          phone?: string | null
          program_id?: string | null
          share_consent?: boolean
          start_date?: string | null
          track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          completed_at?: string | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          distributor_id?: string | null
          fbo_id?: string | null
          gender?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string
          onboarding_complete?: boolean
          phone?: string | null
          program_id?: string | null
          share_consent?: boolean
          start_date?: string | null
          track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_logs: {
        Row: {
          created_at: string
          customer_id: string
          day_number: number
          energy_level: number | null
          hunger_level: number | null
          id: string
          log_date: string
          mood: string | null
          note: string | null
          sleep_hours: number | null
          water_glasses: number | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          day_number: number
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          log_date: string
          mood?: string | null
          note?: string | null
          sleep_hours?: number | null
          water_glasses?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          day_number?: number
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          log_date?: string
          mood?: string | null
          note?: string | null
          sleep_hours?: number | null
          water_glasses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      day_tasks: {
        Row: {
          detail: string | null
          id: string
          product_id: string | null
          program_day_id: string
          slot: string
          sort_order: number
          title: string
        }
        Insert: {
          detail?: string | null
          id?: string
          product_id?: string | null
          program_day_id: string
          slot: string
          sort_order?: number
          title: string
        }
        Update: {
          detail?: string | null
          id?: string
          product_id?: string | null
          program_day_id?: string
          slot?: string
          sort_order?: number
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
      distributors: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          phone: string | null
          updated_at: string
          user_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
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
      free_foods: {
        Row: {
          calories_approx: number | null
          category: string
          created_at: string | null
          id: string
          name: string
          serving_size: string | null
        }
        Insert: {
          calories_approx?: number | null
          category: string
          created_at?: string | null
          id?: string
          name: string
          serving_size?: string | null
        }
        Update: {
          calories_approx?: number | null
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          serving_size?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          distributor_id: string | null
          id: string
          metadata: Json | null
          program: string | null
          source: string | null
          status: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          id?: string
          metadata?: Json | null
          program?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          log_date: string
          meal_id: string
          participant_id: string
          plan_id: string
          status: string
          substitution_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          log_date: string
          meal_id: string
          participant_id: string
          plan_id: string
          status: string
          substitution_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          log_date?: string
          meal_id?: string
          participant_id?: string
          plan_id?: string
          status?: string
          substitution_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calorie_bucket: number
          id: string
          ingredients: string | null
          is_veg: boolean
          method: string | null
          sort_order: number
          title: string
        }
        Insert: {
          calorie_bucket?: number
          id?: string
          ingredients?: string | null
          is_veg?: boolean
          method?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          calorie_bucket?: number
          id?: string
          ingredients?: string | null
          is_veg?: boolean
          method?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      measurements: {
        Row: {
          arm_cm: number | null
          chest_cm: number | null
          created_at: string
          customer_id: string
          day_number: number
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
          day_number: number
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
          day_number?: number
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
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      movement_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          duration_minutes: number
          id: string
          intensity: string | null
          log_date: string | null
          participant_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          duration_minutes: number
          id?: string
          intensity?: string | null
          log_date?: string | null
          participant_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          intensity?: string | null
          log_date?: string | null
          participant_id?: string
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          changes_summary: string | null
          created_at: string | null
          distributor_id: string
          generated_at: string | null
          id: string
          knowledge_version: string | null
          model_info: string | null
          participant_id: string
          plan_data: Json
          reviewed_at: string | null
          reviewed_by: string | null
          rule_version: string | null
          status: string
          updated_at: string | null
          version: number
        }
        Insert: {
          changes_summary?: string | null
          created_at?: string | null
          distributor_id: string
          generated_at?: string | null
          id?: string
          knowledge_version?: string | null
          model_info?: string | null
          participant_id: string
          plan_data: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_version?: string | null
          status: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          changes_summary?: string | null
          created_at?: string | null
          distributor_id?: string
          generated_at?: string | null
          id?: string
          knowledge_version?: string | null
          model_info?: string | null
          participant_id?: string
          plan_data?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_version?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_programs: {
        Row: {
          coach_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          participant_id: string
          program_id: string
          start_date: string | null
          track: string | null
        }
        Insert: {
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          participant_id: string
          program_id: string
          start_date?: string | null
          track?: string | null
        }
        Update: {
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          participant_id?: string
          program_id?: string
          start_date?: string | null
          track?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_programs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
          daily_use: string | null
          how_to_use: string | null
          id: string
          image_url: string | null
          kit_quantity: string | null
          name: string
          short_name: string | null
          sort_order: number
          video_url: string | null
          warnings: string | null
        }
        Insert: {
          daily_use?: string | null
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          kit_quantity?: string | null
          name: string
          short_name?: string | null
          sort_order?: number
          video_url?: string | null
          warnings?: string | null
        }
        Update: {
          daily_use?: string | null
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          kit_quantity?: string | null
          name?: string
          short_name?: string | null
          sort_order?: number
          video_url?: string | null
          warnings?: string | null
        }
        Relationships: []
      }
      program_days: {
        Row: {
          day_number: number
          focus: string | null
          id: string
          program_id: string
          tip: string | null
          title: string
          track: string
        }
        Insert: {
          day_number: number
          focus?: string | null
          id?: string
          program_id: string
          tip?: string | null
          title?: string
          track?: string
        }
        Update: {
          day_number?: number
          focus?: string | null
          id?: string
          program_id?: string
          tip?: string | null
          title?: string
          track?: string
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
      programs: {
        Row: {
          code: string
          created_at: string
          duration_days: number
          id: string
          name: string
          next_program_code: string | null
          sort_order: number
          summary: string | null
        }
        Insert: {
          code: string
          created_at?: string
          duration_days: number
          id?: string
          name: string
          next_program_code?: string | null
          sort_order?: number
          summary?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          duration_days?: number
          id?: string
          name?: string
          next_program_code?: string | null
          sort_order?: number
          summary?: string | null
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string
          customer_id: string
          day_number: number
          id: string
          share_consent: boolean
          storage_path: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          day_number: number
          id?: string
          share_consent?: boolean
          storage_path: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          day_number?: number
          id?: string
          share_consent?: boolean
          storage_path?: string
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
      recipes: {
        Row: {
          calories: number
          category: string
          created_at: string | null
          id: string
          ingredients: string[]
          instructions: string
          is_veg: boolean | null
          name: string
        }
        Insert: {
          calories: number
          category: string
          created_at?: string | null
          id?: string
          ingredients: string[]
          instructions: string
          is_veg?: boolean | null
          name: string
        }
        Update: {
          calories?: number
          category?: string
          created_at?: string | null
          id?: string
          ingredients?: string[]
          instructions?: string
          is_veg?: boolean | null
          name?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string
          customer_id: string
          day_task_id: string
          id: string
          log_date: string
          participant_program_id: string | null
        }
        Insert: {
          completed_at?: string
          customer_id: string
          day_task_id: string
          id?: string
          log_date: string
          participant_program_id?: string | null
        }
        Update: {
          completed_at?: string
          customer_id?: string
          day_task_id?: string
          id?: string
          log_date?: string
          participant_program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_day_task_id_fkey"
            columns: ["day_task_id"]
            isOneToOne: false
            referencedRelation: "day_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_participant_program_id_fkey"
            columns: ["participant_program_id"]
            isOneToOne: false
            referencedRelation: "participant_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          body: string
          day_number: number | null
          id: string
          sort_order: number
        }
        Insert: {
          body: string
          day_number?: number | null
          id?: string
          sort_order?: number
        }
        Update: {
          body?: string
          day_number?: number | null
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      can_access_customer: { Args: { _customer: string }; Returns: boolean }
      claim_access_code: {
        Args: { _code: string; _phone: string }
        Returns: string
      }
      current_day_number: { Args: { _start_date: string }; Returns: number }
      default_distributor_id: { Args: never; Returns: string }
      get_day_with_tasks: {
        Args: { _customer: string; _day: number }
        Returns: Json
      }
      get_ist_day_number: { Args: { _start_date: string }; Returns: number }
      get_my_auth_context: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_app_admin: { Args: { _uid?: string }; Returns: boolean }
      is_my_distributor: { Args: { _customer: string }; Returns: boolean }
      is_platform_admin: { Args: { _uid?: string }; Returns: boolean }
      my_customer_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role:
        | "admin"
        | "coach"
        | "participant"
        | "platform_admin"
        | "tenant_owner"
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
      app_role: [
        "admin",
        "coach",
        "participant",
        "platform_admin",
        "tenant_owner",
      ],
    },
  },
} as const
