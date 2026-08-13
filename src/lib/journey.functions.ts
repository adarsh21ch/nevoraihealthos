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
      // 1. Get customer and their active program reference
      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, onboarding_complete")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer' };

      const { data: activeProgram, error: activeErr } = await supabase
        .from("participant_programs")
        .select("id, program_id, start_date, track")
        .eq("participant_id", userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeErr || !activeProgram) return { state: 'no_content' };

      // 2. Fetch program details
      const { data: program } = await supabase
        .from("programs")
        .select("id, name, duration_days")
        .eq("id", activeProgram.program_id)
        .single();

      // 3. Fetch program days with task counts for progress
      const { data: programDays, error: daysErr } = await supabase
        .from("program_days")
        .select(`
          id, 
          day_number, 
          title,
          focus
        `)
        .eq("program_id", activeProgram.program_id)
        .order("day_number", { ascending: true });

      if (daysErr) return { state: 'error', message: daysErr.message };

      // 4. Fetch all task completions for this participant
      const { data: completions, error: compErr } = await supabase
        .from("task_completions")
        .select("day_task_id, log_date")
        .eq("customer_id", customer.id);

      if (compErr) return { state: 'error', message: compErr.message };

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
