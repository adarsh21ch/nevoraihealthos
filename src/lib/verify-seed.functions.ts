
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyC9Seed = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { data: programs } = await supabaseAdmin.from("programs").select("code, name");
      const { count: dayCount } = await supabaseAdmin.from("program_days").select("*", { count: 'exact', head: true });
      const { count: taskCount } = await supabaseAdmin.from("day_tasks").select("*", { count: 'exact', head: true });
      const { count: foodCount } = await supabaseAdmin.from("free_foods").select("*", { count: 'exact', head: true });
      
      return {
        programs: (programs || []).map(p => ({ code: String(p.code), name: String(p.name) })),
        dayCount: Number(dayCount || 0),
        taskCount: Number(taskCount || 0),
        foodCount: Number(foodCount || 0),
        status: "success"
      };
    } catch (e: any) {
      return { 
        status: "error",
        message: String(e.message)
      };
    }
  });
