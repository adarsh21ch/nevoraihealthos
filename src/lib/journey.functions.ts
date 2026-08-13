import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type JourneyDataResult = {
  state: 'success' | 'not_a_customer' | 'no_content' | 'error';
  message?: string;
  customer?: any;
  program?: any;
  programDays?: any[];
  completions?: any[];
};

export const getJourneyData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JourneyDataResult> => {
    const { supabase, userId } = context;

    try {
      // 1. Get customer and their active program reference in parallel
      const [customerRes, activeProgramRes] = await Promise.all([
        supabase.from("customers").select("id, onboarding_complete").eq("user_id", userId).single(),
        supabase.from("participant_programs").select("id, program_id, start_date, track").eq("participant_id", userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      ]);

      const customer = customerRes.data;
      const activeProgram = activeProgramRes.data;

      if (!customer) return { state: 'not_a_customer' };
      if (!activeProgram) return { state: 'no_content' };

      // 2. Fetch program, days, and completions in parallel
      const [programRes, daysRes, completionsRes] = await Promise.all([
        supabase.from("programs").select("id, name, duration_days").eq("id", activeProgram.program_id).single(),
        supabase.from("program_days").select("id, day_number, title, focus").eq("program_id", activeProgram.program_id).order("day_number", { ascending: true }),
        supabase.from("task_completions").select("day_task_id, log_date").eq("customer_id", customer.id)
      ]);

      if (daysRes.error) return { state: 'error', message: daysRes.error.message };
      if (completionsRes.error) return { state: 'error', message: completionsRes.error.message };

      return {
        state: 'success',
        customer: { ...customer, start_date: activeProgram.start_date, track: activeProgram.track },
        program,
        programDays,
        completions
      };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });
