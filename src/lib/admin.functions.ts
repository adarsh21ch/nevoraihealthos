import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function hasElevatedAccess(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_elevated_access", { _uid: userId });
  if (error) {
    console.error("Error checking elevated access:", error);
    return false;
  }
  return !!data;
}

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    
    if (!isAdmin) throw new Error("Unauthorized");
    return { isAdmin: true };
  });

export const getUserRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase.rpc("get_my_auth_context");
    if (error) throw error;
    return data as { 
      role: 'admin' | 'distributor' | 'customer' | 'guest'; 
      customer_id?: string;
      distributor_id?: string;
    };
  });

export const getDistributors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("distributors")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return data;
  });

export const updateAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    brand_name: z.string().min(2),
    tagline: z.string(),
    whatsapp_number: z.string(),
    health_disclaimer: z.string(),
    results_disclaimer: z.string(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("app_settings")
      .update(data)
      .eq("id", true);

    return { success: true };
  });

export const getMyTenantAccessCode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("registration_codes")
      .select("code")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { accessCode: data?.code ?? "FAT2FIT" };
  });

export const rotateTenantAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    accessCode: z.string()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const isAdmin = await hasElevatedAccess(supabase, userId);
    if (!isAdmin) throw new Error("Unauthorized");

    // Deactivate old codes
    await supabase
      .from("registration_codes")
      .update({ is_active: false })
      .eq("is_active", true);

    // Insert new code
    const { error } = await supabase
      .from("registration_codes")
      .upsert({ 
        code: data.accessCode.toUpperCase(), 
        is_active: true 
      }, { onConflict: 'code' });

    if (error) throw error;
    return { success: true };
  });
