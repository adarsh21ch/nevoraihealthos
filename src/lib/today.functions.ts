
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getISTDateString } from "./date-utils";

export type DayTask = {
  id: string;
  program_day_id: string;
  product_id: string | null;
  title: string;
  dosage: string | null;
  time_slot: string | null;
  sort_order: number;
  product_name?: string;
  product_image?: string;
};

export type ProgramDayContent = {
  day_number: number;
  program_day: {
    id: string;
    program_id: string;
    day_number: number;
    title: string | null;
    motivation: string | null;
    meal_guidance: string | null;
  } | null;
  tasks: DayTask[] | null;
};

export type TodayDataResult = {
  state: 'success' | 'not_a_customer' | 'tenant_not_found' | 'no_content' | 'error';
  message?: string;
  tenant?: any;
  customer?: any;
  enrollment?: any;
  todayStr?: string;
  dailyLog?: any;
  dayContent?: ProgramDayContent;
  redirect?: string;
};

export const getTodayData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantSlug: z.string(),
  }).parse(data))
  .handler(async ({ context, data: input }): Promise<TodayDataResult> => {
    const { supabase, userId } = context;

    try {
      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("id, name, slug, logo_url, whatsapp, primary_color, owner_name")
        .eq("slug", input.tenantSlug)
        .single();
      
      if (tenantErr || !tenant) return { state: 'tenant_not_found' };

      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, tenant_id, health_consent_at")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer', tenant };

      if (customer.tenant_id !== tenant.id) {
          const { data: correctTenant } = await supabase
              .from("tenants")
              .select("slug")
              .eq("id", customer.tenant_id)
              .single();
          return { state: 'success', redirect: `/p/${correctTenant?.slug}/today` };
      }

      if (!customer.health_consent_at) {
        return { state: 'success', redirect: "/onboarding" };
      }

      const { data: enrollment, error: enrollErr } = await supabase
        .from("enrollments")
        .select("id, program_id, start_date, programs(duration_days, name, next_program_code)")
        .eq("customer_id", customer.id)
        .eq("status", "active")
        .single();

      if (enrollErr || !enrollment) {
        return { state: 'success', redirect: "/onboarding" };
      }

      const todayStr = getISTDateString();
      
      const [logRes, dayContentRes] = await Promise.all([
          supabase.from("daily_logs")
              .select("id, water_ml, mood, task_completions(day_task_id)")
              .eq("enrollment_id", enrollment.id)
              .eq("log_date", todayStr)
              .maybeSingle(),
          supabase.rpc("get_program_day_with_tasks", {
              _program_id: enrollment.program_id,
              _date: todayStr,
              _start_date: enrollment.start_date
          })
      ]);

      const dayContent = dayContentRes.data as unknown as ProgramDayContent;
      if (!dayContent?.program_day) {
        return { state: 'no_content', tenant, enrollment };
      }

      return {
          state: 'success',
          tenant,
          customer,
          enrollment,
          todayStr,
          dailyLog: logRes.data,
          dayContent,
      };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });

export const toggleTaskCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    data: z.object({
      enrollmentId: z.string().uuid(),
      dayTaskId: z.string().uuid(),
      logDate: z.string(),
      completed: z.boolean(),
      dayNumber: z.number().int(),
    })
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase } = context;
    const { data } = input;

    const { data: log, error: logErr } = await supabase
      .from("daily_logs")
      .upsert({
        enrollment_id: data.enrollmentId,
        log_date: data.logDate,
        day_number: data.dayNumber
      }, { onConflict: 'enrollment_id, log_date' })
      .select("id")
      .single();

    if (logErr) throw logErr;

    if (data.completed) {
      const { error } = await supabase
        .from("task_completions")
        .upsert({
          daily_log_id: log.id,
          day_task_id: data.dayTaskId
        }, { onConflict: 'daily_log_id, day_task_id' });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("task_completions")
        .delete()
        .eq("daily_log_id", log.id)
        .eq("day_task_id", data.dayTaskId);
      if (error) throw error;
    }

    return { success: true };
  });

export const updateDailyLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    data: z.object({
      enrollmentId: z.string().uuid(),
      logDate: z.string(),
      dayNumber: z.number().int(),
      water_ml: z.number().optional(),
      mood: z.string().optional(),
    })
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase } = context;
    const { data } = input;
    const { error } = await supabase
      .from("daily_logs")
      .upsert({
        enrollment_id: data.enrollmentId,
        log_date: data.logDate,
        day_number: data.dayNumber,
        ...(data.water_ml !== undefined ? { water_ml: data.water_ml } : {}),
        ...(data.mood !== undefined ? { mood: data.mood } : {}),
      }, { onConflict: 'enrollment_id, log_date' });

    if (error) throw error;
    return { success: true };
  });
