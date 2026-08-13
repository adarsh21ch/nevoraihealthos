import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCompletionData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .select("id, name, share_consent, program_id")
      .eq("user_id", userId)
      .single();
    
    if (cErr || !customer) throw new Error("Customer not found");

    const { data: program } = await supabase
      .from("programs")
      .select("id, name, duration_days, next_program_code")
      .eq("id", customer.program_id)
      .maybeSingle();

    const { data: measurements } = await supabase
      .from("measurements")
      .select("weight_kg, waist_cm, taken_on")
      .eq("customer_id", customer.id)
      .order("taken_on", { ascending: true });

    let stats = { weightChange: 0, waistChange: 0 };
    if (measurements && measurements.length >= 2) {
      const first = measurements[0];
      const last = measurements[measurements.length - 1];
      if (first && last) {
        stats.weightChange = (last.weight_kg || 0) - (first.weight_kg || 0);
        stats.waistChange = (last.waist_cm || 0) - (first.waist_cm || 0);
      }
    }

    let nextProgram: any = null;
    if (program?.next_program_code) {
      const { data: nextProg } = await supabase
        .from("programs")
        .select("id, name, code, duration_days")
        .eq("code", program.next_program_code)
        .maybeSingle();
      nextProgram = nextProg;
    }

    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("brand_name")
      .eq("id", true)
      .single();

    return {
      brand_name: appSettings?.brand_name || "Fat2Fit",
      customer,
      program,
      stats,
      nextProgram,
      photos: await (async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: photos } = await supabaseAdmin
          .from("progress_photos")
          .select("id, storage_path, pose, created_at")
          .eq("customer_id", customer.id)
          .eq("share_consent", true)
          .order("created_at", { ascending: true });
        
        if (!photos || photos.length === 0) return [];
        
        return await Promise.all(photos.map(async (p) => {
          const { data: signed } = await supabaseAdmin.storage
            .from("progress-photos")
            .createSignedUrl(p.storage_path, 3600);
          return {
            id: p.id,
            photo_url: signed?.signedUrl || null,
            pose: p.pose,
            created_at: p.created_at
          };
        }));
      })()
    };
  });

export const createReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    leadName: z.string(),
    leadPhone: z.string(),
  }).parse)
  .handler(async ({ context, data }) => {
    return { success: true }; // Placeholder
  });

export const updateShareConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    consent: z.boolean()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("customers")
      .update({ share_consent: data.consent })
      .eq("user_id", userId);
    
    if (error) throw error;
    return { success: true };
  });
