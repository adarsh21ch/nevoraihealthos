import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin, error } = await supabase.rpc("is_app_admin", { _uid: userId });
    if (error || !isAdmin) throw new Error("Unauthorized");
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
    const { data: isAdmin } = await supabase.rpc("is_app_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data, error } = await supabaseAdmin
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
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: isAdmin } = await supabaseAdmin.rpc("is_app_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("app_settings")
      .update(data)
      .eq("id", true);

    return { success: true };
  });

export const getMyTenantAccessCode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { accessCode: "FAT2FIT" }; // Placeholder
  });

export const rotateTenantAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    tenantId: z.string(),
    accessCode: z.string()
  }).parse)
  .handler(async ({ context, data }) => {
    return { success: true };
  });
