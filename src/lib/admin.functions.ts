import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin, error } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (error || !isAdmin) throw new Error("Unauthorized");
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
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 2. Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 3. Create profile link
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: authUser.user.id,
        tenant_id: data.tenantId,
        role: "owner"
      });

    if (profileError) {
       await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
       throw profileError;
    }

    return { success: true };
  });

export const getTenants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data, error } = await supabaseAdmin
      .from("tenants")
      .select("id, slug, name, owner_name, status, logo_url, primary_color, tagline, whatsapp, phone, email, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
      
    if (error) throw error;
    return data;
  });

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export const createTenant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    name: z.string().trim().min(2).max(60),
    ownerEmail: z.string().email(),
    ownerName: z.string().trim().max(80).optional(),
    tagline: z.string().trim().max(120).optional(),
    whatsapp: z.string().trim().max(20).optional(),
    phone: z.string().trim().max(20).optional(),
    logoUrl: z.string().url().optional().or(z.literal("")),
    primaryColor: z.string().default("#16a34a"),
    accessCode: z.string().min(4),
    ownerPassword: z.string().min(6)
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 0. Verify platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    // 1a. Derive a unique slug from the brand name — never asked of the operator
    const base = slugify(data.name) || "tenant";
    let slug = base;
    for (let attempt = 0; attempt < 25; attempt++) {
      const { data: taken } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!taken) break;
      slug = `${base}-${attempt + 2}`;
    }

    // 1. Create tenant row
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .insert({
        slug,
        name: data.name,
        owner_name: data.ownerName?.trim() || data.ownerEmail.split("@")[0] || null,
        email: data.ownerEmail || null,
        tagline: data.tagline || null,
        whatsapp: data.whatsapp || null,
        phone: data.phone || null,
        logo_url: data.logoUrl || null,
        primary_color: data.primaryColor,
        status: 'active'
      })
      .select('id, slug, name')
      .single();

    if (tenantError) throw tenantError;

    try {
      // 2. Create signup credentials
      const { error: credsError } = await supabaseAdmin
        .from("tenant_signup_credentials")
        .insert({
          tenant_id: tenant.id,
          access_code: data.accessCode
        });

      if (credsError) throw credsError;

      // 3. Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.ownerEmail,
        password: data.ownerPassword,
        email_confirm: true,
        user_metadata: { full_name: data.ownerName }
      });

      if (authError) throw authError;

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
        throw profileError;
      }

      return { success: true, tenant };
    } catch (err) {
      // Cleanup tenant on any subsequent failure
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw err;
    }
  });

export const updateTenantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "suspended"])
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Verify admin
    const { data: isAdmin } = await supabaseAdmin.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");
    
    const { error } = await supabaseAdmin
      .from("tenants")
      .update({ 
        status: data.status
      })
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

export const rotateTenantAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid(),
    accessCode: z.string().min(4)
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Verify admin OR owner of this tenant
    const { data: authContext } = await supabaseAdmin.rpc("get_my_auth_context");
    const isPlatformAdmin = (authContext as any)?.role === 'platform_admin';
    const isTenantOwner = (authContext as any)?.role === 'owner' && (authContext as any)?.tenant_id === data.tenantId;

    if (!isPlatformAdmin && !isTenantOwner) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .update({ access_code: data.accessCode })
      .eq("tenant_id", data.tenantId);

    if (error) throw error;
    return { success: true };
  });

export const resetTenantOwnerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid(),
    email: z.string().email(),
    newPassword: z.string().min(6)
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Verify platform admin
    const { data: isAdmin } = await supabaseAdmin.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    // Find the user ID for this owner
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("tenant_id", data.tenantId)
      .eq("role", "owner")
      .single();

    if (!profile) throw new Error("Owner not found");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      profile.user_id,
      { password: data.newPassword }
    );

    if (error) throw error;
    return { success: true };
  });
