import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getISTDateString } from "./date-utils";

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
};

export const getTodayData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.any().optional().parse)
  .handler(async ({ context }): Promise<TodayDataResult> => {
    const { supabase, userId } = context;

    try {
      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, program_id, start_date, onboarding_complete")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer' };

      if (!customer.onboarding_complete) {
        return { state: 'success', redirect: "/onboarding" };
      }

      if (!customer.program_id || !customer.start_date) {
        return { state: 'no_content' };
      }

      const todayStr = getISTDateString();
      
      const [logRes, dayContentRes] = await Promise.all([
          supabase.from("daily_logs")
              .select("id, note, task_completions(day_task_id)")
              .eq("customer_id", customer.id)
              .eq("log_date", todayStr)
              .maybeSingle(),
          supabase.rpc("get_day_with_tasks", {
              _program_id: customer.program_id,
              _date: todayStr,
              _start_date: customer.start_date
          } as any)
      ]);

      const dayContent = dayContentRes.data as unknown as ProgramDayContent;
      
      return {
          state: 'success',
          customer,
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
    })
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase } = context;
    const { data } = input;
    const { error } = await supabase
      .from("daily_logs")
      .upsert({
        customer_id: data.customerId,
        log_date: data.logDate,
        day_number: data.dayNumber,
        ...(data.note !== undefined ? { note: data.note } : {}),
      }, { onConflict: 'customer_id, log_date' });

    if (error) throw error;
    return { success: true };
  });
