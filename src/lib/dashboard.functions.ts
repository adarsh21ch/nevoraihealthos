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
      .select("id, name, share_consent, progress_photos(id, storage_path, pose, taken_on, share_consent)")
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
            .filter((p: any) => p.share_consent)
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

    const { data: row, error } = await supabase
      .from("customers")
      .select(
        `id, name, phone, email, share_consent, user_id,
         enrollments(id, start_date, status, programs(id, name, duration_days)),
         measurements(id, weight_kg, waist_cm, hip_cm, chest_cm, thigh_cm, arm_cm, taken_on),
         progress_photos(id, storage_path, pose, taken_on)`,
      )
      .eq("id", data.customerId)
      .eq("tenant_id", tenantId)
      .single();

    if (error) throw error;

    const enrollments = ((row as any).enrollments ?? []) as any[];
    const activeEnrollment = enrollments.find((e) => e.status === "active") ?? enrollments[0];

    // Daily logs hang off the enrollment, not the customer
    let dailyLogs: any[] = [];
    if (activeEnrollment) {
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("id, log_date, day_number, water_ml, mood, notes")
        .eq("enrollment_id", activeEnrollment.id)
        .order("log_date", { ascending: false })
        .limit(30);
      dailyLogs = (logs ?? []).map((l) => ({
        id: l.id,
        logged_at: l.log_date,
        day_number: l.day_number,
        water_ml: l.water_ml,
        mood: l.mood,
        notes: l.notes,
      }));
    }

    // Private photos: signed URLs, and only when the customer consented to sharing
    let photos: any[] = [];
    if ((row as any).share_consent) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      photos = await Promise.all(
        (((row as any).progress_photos ?? []) as any[]).map(async (p) => {
          const { data: signed } = await supabaseAdmin.storage
            .from("progress-photos")
            .createSignedUrl(p.storage_path, 60 * 60);
          return { id: p.id, photo_url: signed?.signedUrl ?? null, type: p.pose, created_at: p.taken_on };
        }),
      );
    }

    return {
      id: (row as any).id,
      name: (row as any).name,
      phone: (row as any).phone,
      email: (row as any).email,
      share_consent: (row as any).share_consent,
      user_id: (row as any).user_id,
      customer_enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        day_number: istDayNumber(e.start_date),
        programs: e.programs,
      })),
      daily_logs: dailyLogs,
      measurements: (((row as any).measurements ?? []) as any[]).map((m) => ({
        id: m.id,
        weight: m.weight_kg,
        waist: m.waist_cm,
        hip: m.hip_cm,
        chest: m.chest_cm,
        thigh: m.thigh_cm,
        arm: m.arm_cm,
        created_at: m.taken_on,
      })),
      progress_photos: photos,
    };
  });

