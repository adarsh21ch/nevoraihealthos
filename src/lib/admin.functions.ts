import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "platform_admin" });
    if (error || !data) throw new Error("Unauthorized");
    return { isAdmin: true };
  });

export const getUserRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase.rpc("get_my_auth_context");
    if (error) throw error;
    return data as { role: string; tenantSlug: string | null };
  });

export const createTenantOwnerAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(6),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    
    // 1. Verify caller is platform admin
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "platform_admin" });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 2. Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 3. Assign role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: "tenant_owner"
      });

    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw roleError;
    }

    // 4. Create profile link
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: authUser.user.id,
        tenant_id: data.tenantId,
        role: "owner"
      });

    if (profileError) {
       // Roles table will cascade delete on user delete
       await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
       throw profileError;
    }

    return { success: true };
  });

export const getTenants = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .select("id, slug, name, owner_name, status, created_at")
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    return data;
  });

export const createTenant = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    slug: z.string().min(3),
    name: z.string().min(3),
    ownerEmail: z.string().email(),
    ownerName: z.string().min(1),
    accessCode: z.string().min(4)
  }).parse(data))
  .handler(async ({ data }) => {
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
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "suspended"])
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });
