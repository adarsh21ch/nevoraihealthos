
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getJourneyData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantSlug: z.string(),
  }).parse(data))
  .handler(async ({ context, data: input }) => {
    const { supabase, userId } = context;

    // 1. Resolve customer & enrollment
    const { data: customer, error: customerErr } = await supabase
      .from("customers")
      .select("id, tenant_id")
      .eq("user_id", userId)
      .single();

    if (customerErr || !customer) throw new Error("Customer not found");

    const { data: enrollment, error: enrollErr } = await supabase
      .from("enrollments")
      .select("id, program_id, start_date, programs(duration_days, name)")
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .single();

    if (enrollErr || !enrollment) throw new Error("No active enrollment");

    // 2. Fetch all program days and task counts for the program
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

    if (daysErr) throw daysErr;

    // 3. Fetch all task completions for this enrollment
    const { data: completions, error: compErr } = await supabase
      .from("task_completions")
      .select("day_task_id, daily_logs!inner(day_number)")
      .eq("daily_logs.enrollment_id", enrollment.id);

    if (compErr) throw compErr;

    return {
      enrollment,
      programDays,
      completions
    };
  });
