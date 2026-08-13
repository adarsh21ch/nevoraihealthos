import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getISTDateString } from "../date-utils";

export const getMyNutritionPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: plan, error } = await supabase
      .from("nutrition_plans")
      .select("*")
      .eq("participant_id", userId)
      .eq("status", "PUBLISHED")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return plan;
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

    const { error } = await supabase
      .from("meal_logs")
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
    const { data: logs, error } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("participant_id", userId)
      .eq("log_date", data.date);
    
    if (error) throw error;
    return logs;
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

    // 2. Call Gemini Nutrition Engine
    const { generateNutritionPlan } = await import("../ai/nutrition.server");
    const planResult = await generateNutritionPlan({
      geminiKey,
      customer,
      latestMeasurement,
      activeProgram
    });

    // 3. Store the plan
    const { data: newPlan, error: storeError } = await supabase
      .from("nutrition_plans")
      .insert({
        participant_id: userId,
        tenant_id: customer.tenant_id,
        status: 'PUBLISHED',
        plan_data: planResult,
        model_info: 'gemini-1.5-pro'
      })
      .select()
      .single();

    if (storeError) throw storeError;
    return newPlan;
  });
