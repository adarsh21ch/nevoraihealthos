import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    // Check if user is a platform admin using the RLS-protected function
    const { data, error } = await supabase.rpc("is_platform_admin", { _uid: userId });
    
    if (error) {
      console.error("Error checking admin status:", error);
      return { isAdmin: false };
    }
    
    return { isAdmin: !!data };
  });

export const getUserRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    // Check if platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (isAdmin) return { role: "platform_admin", tenantSlug: null };
    
    // Check if customer
    const { data: customer } = await supabase
      .from("customers")
      .select("tenant_id, tenants(slug)")
      .eq("user_id", userId)
      .maybeSingle();

    if (customer) {
      return {
        role: "customer",
        tenantId: customer.tenant_id,
        tenantSlug: (customer.tenants as any)?.slug
      };
    }

    // Check if tenant owner/member (Staff)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, tenant_id, tenants(slug)")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return { role: "guest", tenantSlug: null };
    }
    
    if (profile) {
      return { 
        role: profile.role, 
        tenantId: profile.tenant_id,
        tenantSlug: (profile.tenants as any)?.slug 
      };
    }
    
    return { role: "guest", tenantSlug: null };
  });

export const getTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    // Check admin status again for safety in handler
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) {
      throw new Error("Unauthorized");
    }
    
    const { data, error } = await supabase
      .from("tenants")
      .select("id, slug, name, owner_name, status, created_at")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return data;
  });

export const createTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    slug: z.string().min(3),
    name: z.string().min(3),
    ownerEmail: z.string().email(),
    ownerName: z.string().min(1),
    accessCode: z.string().min(4)
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    
    // Verify requester is platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create tenant row
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        slug: data.slug,
        name: data.name,
        owner_name: data.ownerName,
        email: data.ownerEmail,
        status: 'active'
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. Create signup credentials
    const { error: credsError } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .insert({
        tenant_id: tenant.id,
        access_code: data.accessCode
      });

    if (credsError) {
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw credsError;
    }

    // 3. Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.ownerEmail,
      email_confirm: true,
      user_metadata: { full_name: data.ownerName }
    });

    if (authError) {
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw authError;
    }

    // 4. Create profile link
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: authUser.user.id,
        tenant_id: tenant.id,
        role: "owner"
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw profileError;
    }

    return { success: true, tenant };
  });

export const updateTenantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "suspended"])
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    
    // Verify requester is platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("tenants")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });
