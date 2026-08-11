import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
      .select(`
        id, 
        name, 
        phone, 
        created_at,
        customer_enrollments(
          id,
          day_number,
          programs(name, duration_days)
        )
      `)
      .eq("tenant_id", tenantId)
      .order("name")
      .range(from, to);

    if (data.search) {
      query = query.or(`name.ilike.%${data.search}%,phone.ilike.%${data.search}%`);
    }

    const { data: customers, count, error } = await query;
    if (error) throw error;

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
      .select("id, name, progress_photos(id, photo_url, type, created_at)")
      .eq("tenant_id", tenantId)
      .eq("share_consent", true);

    if (error) throw error;
    return data;
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
        *,
        customer_enrollments(
          *,
          programs(*)
        ),
        daily_logs(*),
        measurements(*),
        progress_photos(*)
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

