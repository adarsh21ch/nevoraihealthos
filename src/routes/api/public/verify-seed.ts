import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

export const Route = createFileRoute('/api/public/verify-seed')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data: programs } = await supabaseAdmin.from("programs" as any).select("code, name");
          const { count: dayCount } = await supabaseAdmin.from("program_days" as any).select("*", { count: 'exact', head: true });
          const { count: taskCount } = await supabaseAdmin.from("day_tasks" as any).select("*", { count: 'exact', head: true });
          const { count: foodCount } = await supabaseAdmin.from("free_foods" as any).select("*", { count: 'exact', head: true });
          
          return new Response(JSON.stringify({
            programs: (programs || []).map((p: any) => ({ code: String(p.code), name: String(p.name) })),
            dayCount: Number(dayCount || 0),
            taskCount: Number(taskCount || 0),
            foodCount: Number(foodCount || 0),
            status: "success"
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ 
            status: "error",
            message: String(e.message)
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
})
