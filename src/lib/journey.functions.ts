
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type JourneyDataResult = {
  state: 'success' | 'not_a_customer' | 'no_content' | 'error';
  message?: string;
  enrollment?: any;
  programDays?: any[];
  completions?: any[];
};

export const getJourneyData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantSlug: z.string(),
  }).parse(data))
  .handler(async ({ context, data: input }): Promise<JourneyDataResult> => {
    const { supabase, userId } = context;

    try {
      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, tenant_id")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer' };

      const { data: enrollment, error: enrollErr } = await supabase
        .from("enrollments")
        .select("id, program_id, start_date, programs(duration_days, name)")
        .eq("customer_id", customer.id)
        .eq("status", "active")
        .single();

      if (enrollErr || !enrollment) return { state: 'no_content' };

      const { data: programDays, error: daysErr } = await supabase
        .from("program_days")
        .select(`
          id, 
          day_number, 
          title, 
          day_tasks(id)
        `)
        .eq("program_id", enrollment.program_id)
        .order("day_number", { ascending: true });

      if (daysErr) return { state: 'error', message: daysErr.message };
      if (!programDays || programDays.length === 0) return { state: 'no_content' };

      const { data: completions, error: compErr } = await supabase
        .from("task_completions")
        .select("day_task_id, daily_logs!inner(day_number)")
        .eq("daily_logs.enrollment_id", enrollment.id);

      if (compErr) return { state: 'error', message: compErr.message };

      return {
        state: 'success',
        enrollment,
        programDays,
        completions
      };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });
