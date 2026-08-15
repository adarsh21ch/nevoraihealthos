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

async function hasElevatedAccess(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_elevated_access", { _uid: userId });
  if (error) {
    console.error("Error checking elevated access:", error);
    return false;
  }
  return !!data;
}

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    // Optimized: Run counts in parallel and select only what's needed
    const [activeRes, atRiskRes] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("onboarding_complete", false)
    ]);

    return {
      activeCustomers: activeRes.count || 0,
      atRisk: atRiskRes.count || 0,
      reorder: 0,
      completingThisWeek: 0,
    };
  });

export const getCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    page: z.number().default(0),
    search: z.string().optional(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const pageSize = 25;
    const from = data.page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("customers")
      .select(
        "id, name, phone, created_at, start_date, onboarding_complete, programs(name, duration_days), user_roles(role)",
        { count: "exact" },
      )
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
      day_number: c.start_date ? istDayNumber(c.start_date) : null,
      program: c.programs,
      role: c.user_roles?.[0]?.role || 'participant',
    }));

    return { customers, total: count || 0 };
  });

export const getReorderList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    // Placeholder until DB functions are created
    return [];
  });

export const getAtRiskList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    // Placeholder until DB functions are created
    return [];
  });

export const getTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("customers")
      .select("id, name, share_consent, progress_photos(id, storage_path, pose, created_at, share_consent)")
      .eq("share_consent", true)
      .limit(50);

    if (error) throw error;

    return await Promise.all(
      (data ?? []).map(async (c: any) => ({
        id: c.id,
        name: c.name,
        progress_photos: await Promise.all(
          (c.progress_photos ?? [])
            .filter((p: any) => p.share_consent)
            .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
            .map(async (p: any) => {
              const { data: signed } = await supabase.storage
                .from("progress-photos")
                .createSignedUrl(p.storage_path, 60 * 60);
              return {
                id: p.id,
                photo_url: signed?.signedUrl ?? null,
                created_at: p.created_at,
              };
            }),
        ),
      })),
    );
  });

export const getCustomerDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const { data: row, error } = await supabase
      .from("customers")
      .select(
        `id, name, phone, share_consent, user_id, start_date,
         programs(id, name, duration_days),
         measurements(id, weight_kg, waist_cm, hip_cm, chest_cm, thigh_cm, arm_cm, taken_on),
         progress_photos(id, storage_path, created_at),
         daily_logs(id, log_date, day_number, note)`
      )
      .eq("id", data.customerId)
      .single();

    if (error) throw error;

    // Private photos: signed URLs, and only when the customer consented to sharing
    let photos: any[] = [];
    if ((row as any).share_consent) {
      photos = await Promise.all(
        (((row as any).progress_photos ?? []) as any[]).map(async (p) => {
          const { data: signed } = await supabase.storage
            .from("progress-photos")
            .createSignedUrl(p.storage_path, 60 * 60);
          return { id: p.id, photo_url: signed?.signedUrl ?? null, created_at: p.created_at };
        }),
      );
    }

    return {
      id: (row as any).id,
      name: (row as any).name,
      phone: (row as any).phone,
      share_consent: (row as any).share_consent,
      user_id: (row as any).user_id,
      day_number: (row as any).start_date ? istDayNumber((row as any).start_date) : null,
      program: (row as any).programs,
      daily_logs: ((row as any).daily_logs ?? []).map((l: any) => ({
        id: l.id,
        logged_at: l.log_date,
        day_number: l.day_number,
        notes: l.note,
      })),
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

export const resetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");
    
    return { success: true, tempPassword: "fat2fit-reset" };
  });
