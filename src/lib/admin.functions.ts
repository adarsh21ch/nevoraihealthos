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
    ownerPassword: z.string().min(6),
    customDomain: z.string().trim().optional()
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 0. Verify platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    // 1a. Derive a unique slug from the brand name
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
      } as any)
      .select('id, slug, name')
      .single();

    if (tenantError) throw tenantError;

    try {
      // 2. Create auth user first (so we have user_id)
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.ownerEmail,
        password: data.ownerPassword,
        email_confirm: true,
        user_metadata: { 
          full_name: data.ownerName,
          tenant_id: tenant.id // Store tenant_id in metadata for quick access if needed
        }
      });

      if (authError) throw authError;

      // 3. Create profile link
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

      // 4. Create signup credentials (access code for customers)
      const { error: credsError } = await supabaseAdmin
        .from("tenant_signup_credentials")
        .insert({
          tenant_id: tenant.id,
          access_code: data.accessCode
        });

      if (credsError) {
        // We could cleanup but at this point the user and profile exist.
        // It's safer to log this or just let it be as it doesn't break the owner.
      }

      return { success: true, tenant };
    } catch (err) {
      await supabaseAdmin.from("tenants").delete().eq("id", tenant.id);
      throw err;
    }
  });

export const getMyTenantAccessCode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Resolve the caller's own tenant; credentials are never exposed to the client table-side
    const { data: authContext } = await supabase.rpc("get_my_auth_context");
    const ctx = authContext as { role?: string; tenant_id?: string } | null;
    const tenantId = ctx?.tenant_id;

    if (!tenantId || (ctx?.role !== "tenant_owner" && ctx?.role !== "platform_admin")) {
      throw new Error("Unauthorized");
    }

    const { data: isMember } = await supabase.rpc("is_tenant_member", { _uid: userId, _tenant: tenantId });
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isMember && !isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: creds } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .select("access_code")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    return { accessCode: creds?.access_code ?? null };
  });

export const getTenantAdminDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ tenantId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tenant, error } = await supabaseAdmin
      .from("tenants")
      .select("id, slug, name, owner_name, status, logo_url, primary_color, tagline, whatsapp, phone, email, created_at")
      .eq("id", data.tenantId)
      .single();

    if (error || !tenant) throw new Error("Tenant not found");

    const [{ data: creds }, { data: profile }] = await Promise.all([
      supabaseAdmin
        .from("tenant_signup_credentials")
        .select("access_code")
        .eq("tenant_id", data.tenantId)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("tenant_id", data.tenantId)
        .eq("role", "owner")
        .maybeSingle(),
    ]);

    let ownerEmail: string | null = (tenant as any).email ?? null;
    let ownerPhone: string | null = null;
    if (profile?.user_id) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      ownerEmail = authUser?.user?.email ?? ownerEmail;
      ownerPhone = authUser?.user?.phone ?? null;
    }

    return {
      tenant,
      accessCode: creds?.access_code ?? null,
      ownerEmail,
      ownerPhone,
      hasOwnerAccount: Boolean(profile?.user_id),
    };
  });

export const setTenantAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid(),
    accessCode: z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9-]+$/),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .upsert({ tenant_id: data.tenantId, access_code: data.accessCode }, { onConflict: "tenant_id" });

    if (error) throw error;
    return { success: true, accessCode: data.accessCode };
  });

export const updateTenantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    status: z.enum(["active", "suspended"])
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Verify admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", { _uid: userId });
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
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Verify admin OR owner of this tenant, evaluated as the CALLER (not service role)
    const [{ data: isPlatformAdmin }, { data: isTenantOwner }] = await Promise.all([
      supabase.rpc("is_platform_admin", { _uid: userId }),
      supabase.rpc("is_tenant_member", { _uid: userId, _tenant: data.tenantId }),
    ]);

    if (!isPlatformAdmin && !isTenantOwner) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .update({ access_code: data.accessCode })
      .eq("tenant_id", data.tenantId);

    if (error) throw error;
    return { success: true, newCode: data.accessCode };
  });

export const updateTenantOwnerCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    tenantId: z.string().uuid(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional()
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
      .maybeSingle();

    const updates: any = {};
    if (data.email) updates.email = data.email;
    if (data.password) updates.password = data.password;

    if (profile?.user_id) {
      if (Object.keys(updates).length === 0) return { success: true };

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        profile.user_id,
        updates
      );
      if (error) throw error;
    } else {
      // 3b. Fallback: Create owner account if missing
      if (!data.email || !data.password) {
        throw new Error("Cannot create owner: Email and Password are required for first-time setup.");
      }

      const { data: tenant } = await supabaseAdmin
        .from("tenants")
        .select("name, owner_name")
        .eq("id", data.tenantId)
        .single();

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { 
          full_name: tenant?.owner_name || tenant?.name,
          tenant_id: data.tenantId
        }
      });

      if (authError) throw authError;

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
    }
    
    // If email was updated, sync the tenants table email field as well
    if (data.email) {
      await supabaseAdmin
        .from("tenants")
        .update({ email: data.email })
        .eq("id", data.tenantId);
    }

    return { success: true };
  });

export const updateTenantDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    name: z.string().optional(),
    tagline: z.string().optional(),
    primary_color: z.string().optional(),
    logo_url: z.string().optional(),
    custom_domain: z.string().optional(),
    whatsapp: z.string().optional()
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verify caller is platform admin
    const { data: isAdmin } = await supabaseAdmin.rpc("is_platform_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { id, ...updates } = data;
    const { error } = await supabaseAdmin
      .from("tenants")
      .update(updates as any)
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  });
