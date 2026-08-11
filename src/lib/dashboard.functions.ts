import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Day number of a program in IST (start date = day 1). */
function istDayNumber(startDate: string): number {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const today = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  const [y, m, d] = startDate.split("-").map(Number);
  const start = Date.UTC(y!, (m ?? 1) - 1, d ?? 1);
  return Math.floor((today - start) / 86400000) + 1;
}

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const [activeCount, atRiskCount, reorderCount] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
      supabase.rpc("get_at_risk_customers_count" as any, { _tenant_id: tenantId }),
      (supabase as any).rpc("get_reorder_customers_count", { _tenant_id: tenantId })
    ]);

    return {
      activeCustomers: activeCount.count || 0,
      atRisk: atRiskCount.data || 0,
      reorder: reorderCount.data || 0,
      completingThisWeek: 0, // Placeholder or calculated
    };
  });

export const getCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    page: z.number().default(0),
    search: z.string().optional(),
  }))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const pageSize = 25;
    const from = data.page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("customers")
      .select(
        "id, name, phone, created_at, enrollments(id, start_date, status, programs(name, duration_days))",
        { count: "exact" },
      )
      .eq("tenant_id", tenantId)
      .order("name")
      .range(from, to);

    if (data.search) {
      query = query.or(`name.ilike.%${data.search}%,phone.ilike.%${data.search}%`);
    }

    const { data: rows, count, error } = await query;
    if (error) throw error;

    const customers = (rows ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      created_at: c.created_at,
      customer_enrollments: (c.enrollments ?? [])
        .filter((e: any) => e.status === "active")
        .map((e: any) => ({
          id: e.id,
          day_number: istDayNumber(e.start_date),
          programs: e.programs,
        })),
    }));

    return { customers, total: count || 0 };
  });

export const getReorderList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const { data, error } = await (supabase as any).rpc("get_reorder_list", { _tenant_id: tenantId });
    if (error) throw error;
    return data;
  });

export const getAtRiskList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const { data, error } = await (supabase as any).rpc("get_at_risk_list", { _tenant_id: tenantId });
    if (error) throw error;
    return data;
  });

export const getTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, progress_photos(id, storage_path, pose, taken_on)")
      .eq("tenant_id", tenantId)
      .eq("share_consent", true)
      .limit(50);

    if (error) throw error;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    return await Promise.all(
      (data ?? []).map(async (c: any) => ({
        id: c.id,
        name: c.name,
        progress_photos: await Promise.all(
          (c.progress_photos ?? [])
            .sort((a: any, b: any) => a.taken_on.localeCompare(b.taken_on))
            .map(async (p: any) => {
              const { data: signed } = await supabaseAdmin.storage
                .from("progress-photos")
                .createSignedUrl(p.storage_path, 60 * 60);
              return {
                id: p.id,
                photo_url: signed?.signedUrl ?? null,
                type: p.pose,
                created_at: p.taken_on,
              };
            }),
        ),
      })),
    );
  });

export const resetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    // 1. Verify customer belongs to tenant
    const { data: customer } = await supabase
      .from("customers")
      .select("user_id")
      .eq("id", data.customerId)
      .eq("tenant_id", tenantId)
      .single();

    if (!customer?.user_id) throw new Error("Customer not found or no associated user");

    // 2. Reset via admin API (e.g., set to a temporary password or clear)
    const tempPassword = Math.random().toString(36).slice(-8);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      customer.user_id,
      { password: tempPassword }
    );

    if (error) throw error;
    return { success: true, tempPassword };
  });

export const getCustomerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: authCtx } = await supabase.rpc("get_my_auth_context");
    const tenantId = (authCtx as any)?.tenant_id;
    if (!tenantId) throw new Error("Unauthorized");

    const { data: customer, error } = await supabase
      .from("customers")
      .select(`
        id, name, phone, email, share_consent, user_id,
        customer_enrollments(
          id, day_number, status,
          programs(id, name, duration_days)
        ),
        daily_logs(id, logged_at, weight, mood, energy, soreness, sleep, adherence_score),
        measurements(id, weight, waist, hip, chest, thigh, arm, created_at),
        progress_photos(id, photo_url, type, created_at)
      `)
      .eq("id", data.customerId)
      .eq("tenant_id", tenantId)
      .single();

    if (error) throw error;
    
    // Filter photos based on share_consent if needed, 
    // but the dashboard owner should see them anyway for management.
    // The prompt says "photos (ONLY if share_consent)", so I will respect that
    // if the goal is to show what the CUSTOMER sees or for a "gallery" view.
    // However, as a coach, seeing progress photos is usually standard.
    // Re-reading prompt: "CUSTOMER DETAIL: ... photos (ONLY if share_consent)"
    if (!customer.share_consent) {
       customer.progress_photos = [];
    }

    return customer;
  });

