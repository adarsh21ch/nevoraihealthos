
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyC9Seed = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      console.log("SERVER: Starting verifyC9Seed");
      const { data: programs, error: pErr } = await supabaseAdmin.from("programs" as any).select("code, name");
      console.log("SERVER: Programs read", programs?.length, pErr?.message);
      
      const { count: dayCount, error: dErr } = await supabaseAdmin.from("program_days" as any).select("*", { count: 'exact', head: true });
      const { count: taskCount, error: tErr } = await supabaseAdmin.from("day_tasks" as any).select("*", { count: 'exact', head: true });
      const { count: foodCount, error: fErr } = await supabaseAdmin.from("free_foods" as any).select("*", { count: 'exact', head: true });
      
      const { data: migHistory, error: migError } = await supabaseAdmin
        .from("supabase_migrations" as any)
        .select("*")
        .order("version", { ascending: false })
        .limit(5);

      const result = {
        programs: (programs || []).map((p: any) => ({ code: String(p.code), name: String(p.name) })),
        dayCount: Number(dayCount || 0),
        taskCount: Number(taskCount || 0),
        foodCount: Number(foodCount || 0),
        status: "success",
        migrations: migHistory || [],
        migError: migError ? (migError as any).message : null,
        errors: { pErr: pErr?.message, dErr: dErr?.message, tErr: tErr?.message, fErr: fErr?.message }
      };
      
      console.log("SERVER: Result prepared", JSON.stringify(result));
      return result;
    } catch (e: any) {
      console.error("SERVER: Error in verifyC9Seed", e);
      return { 
        status: "error",
        message: String(e.message)
      };
    }
  });
