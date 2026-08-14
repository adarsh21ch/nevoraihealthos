import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Types for the nutrition plan results
 */
export interface NutritionPlan {
  id: string;
  participant_id: string;
  distributor_id: string;
  version: number;
  status: 'DRAFT' | 'AI_GENERATED' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  plan_data: any;
  knowledge_version?: string;
  rule_version?: string;
  model_info: string;
  reviewed_by?: string;
  reviewed_at?: string;
  changes_summary?: string;
  generated_at: string;
}

export interface MealLog {
  id: string;
  participant_id: string;
  plan_id: string;
  meal_id: string;
  log_date: string;
  status: 'COMPLETED' | 'SUBSTITUTED' | 'SKIPPED';
  substitution_data?: any;
  completed_at: string;
}

export const getMyNutritionPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const table: any = "nutrition_plans";
    const { data: plan, error } = await supabase
      .from(table)
      .select("*")
      .eq("participant_id", userId)
      .eq("status", "PUBLISHED")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (plan as unknown) as NutritionPlan | null;
  });

export const logMealStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    planId: z.string().uuid(),
    mealId: z.string(),
    date: z.string(),
    status: z.enum(['COMPLETED', 'SUBSTITUTED', 'SKIPPED']),
    substitutionData: z.any().optional()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const table: any = "meal_logs";

    const { error } = await supabase
      .from(table)
      .upsert({
        participant_id: userId,
        plan_id: data.planId,
        meal_id: data.mealId,
        log_date: data.date,
        status: data.status,
        substitution_data: data.substitutionData,
        completed_at: new Date().toISOString()
      }, { onConflict: 'participant_id, log_date, meal_id' });

    if (error) throw error;
    return { success: true };
  });

export const getMealLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    date: z.string()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const table: any = "meal_logs";
    
    const { data: logs, error } = await supabase
      .from(table)
      .select("*")
      .eq("participant_id", userId)
      .eq("log_date", data.date);
    
    if (error) throw error;
    return (logs as unknown) as MealLog[];
  });

export const generateMyPersonalizedPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const geminiKey = process.env['GOOGLE_GEMINI_API_KEY'];
    if (!geminiKey) throw new Error("AI Coach not configured");

    // 1. Gather all personalization inputs
    const [customerRes, measurementsRes, programRes] = await Promise.all([
      supabase.from("customers").select("*").eq("user_id", userId).single(),
      supabase.from("measurements").select("*").eq("customer_id", userId).order("taken_on", { ascending: false }).limit(1),
      supabase.from("participant_programs").select("*, programs(*)").eq("participant_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
    ]);

    const customer = customerRes.data;
    const latestMeasurement = measurementsRes.data?.[0];
    const activeProgram = programRes.data;

    if (!customer) throw new Error("Customer profile not found");

    // 2. Validate Profile Readiness
    const requiredFields = ['name', 'dob', 'height_cm', 'weight_kg', 'waist_cm', 'goal', 'activity_level', 'diet_preference', 'cooking_access'];
    const missing = requiredFields.filter(f => !(customer as any)[f]);
    if (missing.length > 0) {
      throw new Error(`Profile incomplete. Missing: ${missing.join(', ')}`);
    }


    // 3. Call Nutrition Engine with Fallback
    const { generateNutritionPlan } = await import("../ai/nutrition.server");
    let planResult: any;
    let modelUsed = 'gemini-1.5-flash';

    try {
      planResult = await generateNutritionPlan({
        supabase,
        geminiKey,
        customer,
        latestMeasurement,
        activeProgram
      });
    } catch (aiError) {
      console.error("[NutritionEngine] AI Failed, activating scientific fallback:", aiError);
      const { generateFallbackNutritionPlan } = await import("./fallback.server");
      planResult = generateFallbackNutritionPlan({
        customer,
        latestMeasurement,
        programTrack: (activeProgram?.track === 'DX4' ? 'DX4' : 'C9')
      });
      modelUsed = 'scientific-fallback-v1';
    }

    // 4. Store the plan
    const table: any = "nutrition_plans";
    const { data: newPlan, error: storeError } = await supabase
      .from(table)
      .insert({
        participant_id: userId,
        distributor_id: (customer as any).distributor_id,
        status: 'PUBLISHED',
        plan_data: planResult,
        model_info: modelUsed,
        knowledge_version: planResult.knowledge_version || '1.0'
      })
      .select()
      .single();

    if (storeError) throw storeError;
    return (newPlan as unknown) as NutritionPlan;
  });
