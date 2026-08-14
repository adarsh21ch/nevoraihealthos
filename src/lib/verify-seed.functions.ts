
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyC9Seed = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data: programs } = await supabaseAdmin.from("programs").select("code, name");
    const { count: dayCount } = await supabaseAdmin.from("program_days").select("*", { count: 'exact', head: true });
    const { count: taskCount } = await supabaseAdmin.from("day_tasks").select("*", { count: 'exact', head: true });
    const { count: foodCount } = await supabaseAdmin.from("free_foods").select("*", { count: 'exact', head: true });
    
    return {
      programs,
      dayCount,
      taskCount,
      foodCount
    };
  });
