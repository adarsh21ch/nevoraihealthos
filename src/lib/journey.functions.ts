import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("id, program_id, start_date")
        .eq("user_id", userId)
        .single();

      if (customerErr || !customer) return { state: 'not_a_customer' };
      if (!customer.program_id) return { state: 'no_content' };

      const { data: program } = await supabase
        .from("programs")
        .select("id, name, duration_days")
        .eq("id", customer.program_id)
        .single();

      const { data: programDays, error: daysErr } = await supabase
        .from("program_days")
        .select(`
          id, 
          day_number, 
          title, 
          day_tasks(id)
        `)
        .eq("program_id", customer.program_id)
        .order("day_number", { ascending: true });

      if (daysErr) return { state: 'error', message: daysErr.message };
      if (!programDays || programDays.length === 0) return { state: 'no_content' };

      const { data: completions, error: compErr } = await supabase
        .from("task_completions")
        .select("day_task_id, customer_id")
        .eq("customer_id", customer.id);

      if (compErr) return { state: 'error', message: compErr.message };

      return {
        state: 'success',
        customer,
        program,
        programDays,
        completions
      };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });
