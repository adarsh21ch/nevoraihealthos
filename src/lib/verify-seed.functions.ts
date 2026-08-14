
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyC9Seed = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { data: programs, error: progErr } = await supabaseAdmin.from("programs").select("code, name");
      const { count: dayCount, error: dayErr } = await supabaseAdmin.from("program_days").select("*", { count: 'exact', head: true });
      const { count: taskCount, error: taskErr } = await supabaseAdmin.from("day_tasks").select("*", { count: 'exact', head: true });
      const { count: foodCount, error: foodErr } = await supabaseAdmin.from("free_foods").select("*", { count: 'exact', head: true });
      
      const { data: migrations, error: migErr } = await supabaseAdmin.from("_migrations").select("*");

      return {
        programs: programs || [],
        dayCount: dayCount || 0,
        taskCount: taskCount || 0,
        foodCount: foodCount || 0,
        errors: { progErr, dayErr, taskErr, foodErr, migErr },
        migrations: migrations || []
      };
    } catch (e: any) {
      return { error: e.message, stack: e.stack };
    }
  });
