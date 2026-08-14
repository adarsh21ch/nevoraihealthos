
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyC9Seed = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const { data: programs } = await supabaseAdmin.from("programs" as any).select("code, name");
      const { count: dayCount } = await supabaseAdmin.from("program_days" as any).select("*", { count: 'exact', head: true });
      const { count: taskCount } = await supabaseAdmin.from("day_tasks" as any).select("*", { count: 'exact', head: true });
      const { count: foodCount } = await supabaseAdmin.from("free_foods" as any).select("*", { count: 'exact', head: true });
      
      const { data: migHistory, error: migError } = await supabaseAdmin
        .from("_migrations" as any)
        .select("*")
        .order("version", { ascending: false })
        .limit(5)
        .catch(() => ({ data: null, error: { message: "Table not found" } }));

      return {
        programs: (programs || []).map((p: any) => ({ code: String(p.code), name: String(p.name) })),
        dayCount: Number(dayCount || 0),
        taskCount: Number(taskCount || 0),
        foodCount: Number(foodCount || 0),
        status: "success",
        migrations: migHistory || [],
        migError: migError ? (migError as any).message : null
      };
    } catch (e: any) {
      return { 
        status: "error",
        message: String(e.message)
      };
    }
  });
