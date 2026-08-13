import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const createCustomerAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
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

    // 1. Check access code and FBO ID
    const { data: creds, error: credsError } = await supabaseAdmin
      .from("access_codes")
      .select("id, phone")
      .eq("code", data.access_code)
      .is("used_at", null)
      .maybeSingle();

    if (credsError || !creds) {
      throw new Error("Invalid or already used access code");
    }

    // 2. Create Auth User
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

    // 3. Create Customer Row
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .insert({
        user_id: authUser.user.id,
        phone: data.phone || signupValue,
        name: "", // Initial empty name, will be filled in onboarding
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw customerError;
    }

    // 4. Mark access code as used
    await supabaseAdmin
      .from("access_codes")
      .update({ used_at: new Date().toISOString(), customer_id: customer.id })
      .eq("id", creds.id);

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

    // Try finding by phone (the identifier used for customers usually)
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("phone")
      .eq("phone", data.identifier)
      .maybeSingle();

    if (customer) {
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
    
    const { data: canAccess, error: accessError } = await supabase.rpc("can_access_customer", { 
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
