import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCompletionData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    tenantSlug: z.string()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, slug, logo_url, whatsapp_number, primary_color")
      .eq("slug", data.tenantSlug)
      .single();
    
    if (!tenant) throw new Error("Tenant not found");

    const { data: customer } = await supabase
      .from("customers")
      .select("id, first_name, last_name, share_consent")
      .eq("user_id", userId)
      .single();
    
    if (!customer) throw new Error("Customer not found");

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select(`
        id, 
        program_id, 
        start_date, 
        programs (
          id, 
          name, 
          duration_days, 
          next_program_code
        )
      `)
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .single();

    if (!enrollment) throw new Error("No active enrollment found");

    // Get first and last measurements for summary
    const { data: measurements } = await supabase
      .from("measurements")
      .select("weight_kg, waist_cm, taken_on")
      .eq("customer_id", customer.id)
      .order("taken_on", { ascending: true });

    let stats = { weightChange: 0, waistChange: 0 };
    if (measurements && measurements.length >= 2) {
      const first = measurements[0];
      const last = measurements[measurements.length - 1];
      stats.weightChange = (last.weight_kg || 0) - (first.weight_kg || 0);
      stats.waistChange = (last.waist_cm || 0) - (first.waist_cm || 0);
    }

    let nextProgram = null;
    if (enrollment.programs?.next_program_code) {
      const { data: nextProg } = await supabase
        .from("programs")
        .select("id, name, code, duration_days")
        .eq("code", enrollment.programs.next_program_code)
        .eq("tenant_id", tenant.id)
        .maybeSingle();
      nextProgram = nextProg;
    }

    const { data: owner } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("tenant_id", tenant.id)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    return {
      tenant,
      customer,
      enrollment,
      stats,
      nextProgram,
      ownerName: owner?.full_name || tenant.name
    };
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

export const createReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    tenantId: z.string().uuid(),
    leadName: z.string(),
    leadPhone: z.string(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", userId)
      .single();
    
    if (!customer) throw new Error("Customer not found");

    const { error } = await supabase
      .from("referrals")
      .insert({
        tenant_id: data.tenantId,
        referrer_customer_id: customer.id,
        lead_name: data.leadName,
        lead_phone: data.leadPhone
      });
    
    if (error) throw error;
    return { success: true };
  });
