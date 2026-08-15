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

    const { data: isAdmin } = await supabase.rpc("is_app_admin", { _uid: userId });
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
    
    // Get distributor_id first - check both user_id match and the auth context
    const { data: profile } = await supabase
      .from("distributors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      // Fallback: Check if the user is an admin, they might not have a distributor record but should still see/manage?
      // Or maybe they are logged in but distributor record is missing.
      return { accessCode: null, distributorId: null };
    }

    const { data: codeRecord } = await supabase
      .from("access_codes")
      .select("code")
      .eq("distributor_id", profile.id)
      .eq("is_permanent", true)
      .maybeSingle();

    return { 
      accessCode: codeRecord?.code || null,
      distributorId: profile.id 
    };
  });

export const rotateTenantAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string(), // This is distributor_id
    accessCode: z.string().min(4)
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Verify ownership
    const { data: dist } = await supabase
      .from("distributors")
      .select("id")
      .eq("user_id", userId)
      .eq("id", data.tenantId)
      .maybeSingle();

    if (!dist) throw new Error("Unauthorized");

    // Update or Insert permanent code
    const { data: existing } = await supabase
      .from("access_codes")
      .select("id")
      .eq("distributor_id", data.tenantId)
      .eq("is_permanent", true)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("access_codes")
        .update({ code: data.accessCode.toUpperCase() })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("access_codes")
        .insert({ 
          code: data.accessCode.toUpperCase(), 
          is_permanent: true, 
          distributor_id: data.tenantId 
        });
      if (error) throw error;
    }

    return { success: true };
  });
