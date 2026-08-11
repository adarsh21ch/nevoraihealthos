import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const createCustomerAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    tenant_slug: z.string(),
    access_code: z.string(),
    fbo_id: z.string(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    facebook_id: z.string().optional().nullable(),
    password: z.string().min(6),
  }).refine(data => data.email || data.phone || data.facebook_id, {
    message: "At least one of email, phone, or Facebook ID is required",
    path: ["email"]
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Resolve tenant by slug
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id")
      .eq("slug", data.tenant_slug)
      .single();

    if (tenantError || !tenant) {
      throw new Error("Invalid tenant or access code");
    }

    // Check access code
    const { data: creds, error: credsError } = await supabaseAdmin
      .from("tenant_signup_credentials")
      .select("access_code")
      .eq("tenant_id", tenant.id)
      .single();

    if (credsError || creds.access_code !== data.access_code) {
      throw new Error("Invalid tenant or access code");
    }

    // 2. Check if fbo_id exists
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("fbo_id", data.fbo_id)
      .maybeSingle();

    if (existingCustomer) {
      throw new Error("Already registered — try logging in");
    }

    // 3. Create Auth User
    // If Facebook ID is used, we create a mock email to use as the primary identifier
    let signupValue = "";
    let signupMethod: 'email' | 'phone' | 'facebook' = 'email';

    if (data.facebook_id) {
      signupValue = `${data.facebook_id}@facebook.temp`;
      signupMethod = 'facebook';
    } else if (data.email) {
      signupValue = data.email;
      signupMethod = 'email';
    } else if (data.phone) {
      signupValue = data.phone;
      signupMethod = 'phone';
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      ...(signupMethod === 'phone' ? { phone: signupValue, phone_confirm: true } : { email: signupValue, email_confirm: true }),
      password: data.password,
    });

    if (authError) throw authError;

    // 4. Create Customer Row
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        tenant_id: tenant.id,
        user_id: authUser.user.id,
        fbo_id: data.fbo_id,
        email: data.email || (signupMethod === 'facebook' ? signupValue : null),
        phone: data.phone || null,
        name: "", // Initial empty name, will be filled in onboarding wizard step 1
      });

    if (customerError) {
      // Cleanup auth user on failure
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw customerError;
    }

    return { 
      success: true, 
      method: signupMethod, 
      value: signupValue 
    };
  });

export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    identifier: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Sequential lookups to avoid injection in .or()
    const tryFind = async (column: 'fbo_id' | 'email' | 'phone') => {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("email, phone")
        .eq(column, data.identifier)
        .maybeSingle();
      return customer;
    };

    const customer =
      (await tryFind("fbo_id")) ??
      (await tryFind("email")) ??
      (await tryFind("phone"));

    if (!customer) {
      return { found: false };
    }

    // Determine real auth identity
    if (customer.email) {
      return { found: true, method: 'email' as const, value: customer.email };
    } else if (customer.phone) {
      return { found: true, method: 'phone' as const, value: customer.phone };
    }

    return { found: false };
  });

export const adminResetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    customerId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check authorization using the RLS-protected function via request-scoped client
    const { data: canAccess, error: accessError } = await supabase.rpc("can_access_customer", { 
      _uid: userId,
      _customer: data.customerId 
    });

    if (accessError || !canAccess) {
      throw new Error("Unauthorized");
    }

    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("user_id")
      .eq("id", data.customerId)
      .single();
      
    if (customerError || !customer || !customer.user_id) throw new Error("Customer not found");

    const tempPassword = Math.random().toString(36).slice(-8);
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      customer.user_id,
      { password: tempPassword }
    );

    if (authError) throw authError;

    return { success: true, tempPassword };
  });
