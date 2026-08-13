import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getISTDateString, getProgramDayNumber } from "./date-utils";

export type DayTask = {
  id: string;
  program_day_id: string;
  product_id: string | null;
  title: string;
  detail: string | null;
  slot: string;
  sort_order: number;
  product?: {
    name: string;
    image_url: string | null;
  };
};

export type ProgramDayContent = {
  day_number: number;
  program_day: {
    id: string;
    program_id: string;
    day_number: number;
    title: string;
    focus: string | null;
    tip: string | null;
  } | null;
  tasks: DayTask[] | null;
};

export type TodayDataResult = {
  state: 'success' | 'not_a_customer' | 'no_content' | 'error';
  message?: string;
  customer?: any;
  todayStr?: string;
  dailyLog?: any;
  dayContent?: ProgramDayContent;
  redirect?: string;
  dayNumber?: number;
};

export const getTodayData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.any().optional().parse)
  .handler(async ({ context }): Promise<TodayDataResult> => {
    const { supabase, userId } = context;

    try {
      // 1. Get customer and their active program
      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, onboarding_complete, program_id")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer' };
      if (!customer.onboarding_complete) {
        return { state: 'success', redirect: "/onboarding" };
      }

      const { data: activeProgram, error: progErr } = await supabase
        .from("participant_programs")
        .select("program_id, start_date, track")
        .eq("participant_id", userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const actualProgramId = activeProgram?.program_id || customer.program_id;

      if (!actualProgramId) {
        return { state: 'no_content', message: "No active program found." };
      }

      const todayStr = getISTDateString();
      // If we don't have a start_date, we might be in a weird state, but try to recover or show content
      const dayNumber = activeProgram?.start_date ? getProgramDayNumber(activeProgram.start_date) : 1;
      
      // If program is finished (Day 10+)
      if (dayNumber > 9) {
          return { state: 'success', dayNumber, redirect: '/p/fat2fit/complete' as any };
      }

      // 2. Fetch daily log and tasks
      const [logRes, dayContentRes] = await Promise.all([
          supabase.from("daily_logs")
              .select(`
                id, 
                note, 
                water_glasses, 
                sleep_hours, 
                mood, 
                energy_level,
                task_completions(day_task_id)
              `)
              .eq("customer_id", customer.id)
              .eq("log_date", todayStr)
              .maybeSingle(),
          supabase.rpc("get_day_with_tasks", {
              _program_id: actualProgramId,
              _date: todayStr,
              _start_date: activeProgram?.start_date || todayStr
          } as any)
      ]);

      const dayContent = dayContentRes.data as unknown as ProgramDayContent;
      
      return {
          state: 'success',
          customer: { ...customer, track: activeProgram?.track || 'standard' },
          todayStr,
          dailyLog: logRes.data,
          dayContent,
          dayNumber
      };
    } catch (e: any) {
      console.error("Error in getTodayData:", e);
      return { state: 'error', message: e.message || "An unexpected error occurred while loading your daily protocol." };
    }
  });

export const toggleTaskCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    data: z.object({
      customerId: z.string().uuid(),
      dayTaskId: z.string().uuid(),
      logDate: z.string(),
      completed: z.boolean(),
      dayNumber: z.number().int(),
    })
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase } = context;
    const { data } = input;

    if (data.completed) {
      const { error } = await supabase
        .from("task_completions")
        .upsert({
          customer_id: data.customerId,
          day_task_id: data.dayTaskId,
          log_date: data.logDate
        }, { onConflict: 'customer_id, day_task_id, log_date' });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("task_completions")
        .delete()
        .eq("customer_id", data.customerId)
        .eq("day_task_id", data.dayTaskId)
        .eq("log_date", data.logDate);
      if (error) throw error;
    }

    return { success: true };
  });

export const updateDailyLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    data: z.object({
      customerId: z.string().uuid(),
      logDate: z.string(),
      dayNumber: z.number().int(),
      note: z.string().optional(),
      water_glasses: z.number().int().min(0).max(20).optional(),
      sleep_hours: z.number().min(0).max(24).optional(),
      mood: z.string().optional(),
      energy_level: z.string().optional(),
    })
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase } = context;
    const { data } = input;
    
    const updateData: any = {
      customer_id: data.customerId,
      log_date: data.logDate,
      day_number: data.dayNumber,
    };

    if (data.note !== undefined) updateData.note = data.note;
    if (data.water_glasses !== undefined) updateData.water_glasses = data.water_glasses;
    if (data.sleep_hours !== undefined) updateData.sleep_hours = data.sleep_hours;
    if (data.mood !== undefined) updateData.mood = data.mood;
    if (data.energy_level !== undefined) updateData.energy_level = data.energy_level;

    const { error } = await supabase
      .from("daily_logs")
      .upsert(updateData, { onConflict: 'customer_id, log_date' });

    if (error) throw error;
    return { success: true };
  });
