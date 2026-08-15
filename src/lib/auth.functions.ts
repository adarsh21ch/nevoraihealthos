import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const createCustomerAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    access_code: z.string(),
    fbo_id: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");

    // 1. Check registration code via RPC (Public/Security Definer)
    const { data: isValid, error: regError } = await supabase
      .rpc("is_registration_code_valid", { _code: data.access_code });

    if (regError || !isValid) {
      console.error("Registration code validation error:", regError);
      throw new Error("Invalid registration code. Please contact your coach.");
    }

    // Now we need the Admin client for sensitive creation operations
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // CRITICAL: We need a reliable way to check if supabaseAdmin is functional
    // before attempting to use it. If keys are missing, we should fail gracefully.
    try {
      // Accessing a property on the proxy will trigger the check in client.server.ts
      const _check = supabaseAdmin.auth; 
    } catch (e: any) {
      console.error("Supabase Admin not available:", e.message);
      throw new Error("Account creation is currently unavailable. Please contact your coach to verify the system setup.");
    }

    // 2. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      password: data.password,
      user_metadata: { fbo_id: data.fbo_id }
    });

    if (authError) throw authError;

    // 3. Assign Role (Participant)
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: 'participant'
      });
    
    if (roleError) {
        try { await supabaseAdmin.auth.admin.deleteUser(authUser.user.id); } catch (e) {}
        throw roleError;
    }

    // 4. Create Customer Row (Legacy support)
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        user_id: authUser.user.id,
        fbo_id: data.fbo_id,
        name: data.email.split('@')[0],
        onboarding_complete: false,
      } as any)
      .select("id")
      .single();

    if (customerError || !customer) {
      console.error("Customer creation error:", customerError);
      try { await supabaseAdmin.auth.admin.deleteUser(authUser.user.id); } catch (e) {}
      throw new Error(`Failed to create customer profile: ${customerError?.message || 'Unknown error'}`);
    }

    // 5. Registration code tracking (optional logging or usage count could go here)
    // For now we just allow the same code to be used by multiple participants if active
    console.log("Customer account created using registration code:", data.access_code);

    return { 
      success: true, 
      method: 'email', 
      value: data.email 
    };
  });

export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    identifier: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");

    // Try finding by FBO ID in customers table
    const { data: customer } = await supabase
      .from("customers")
      .select("user_id")
      .eq("fbo_id" as any, data.identifier)
      .maybeSingle();
      
    if (customer && customer.user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(customer.user_id);
      if (user?.user?.email) {
        return { found: true, method: 'email' as const, value: user.user.email };
      }
    }

    return { found: false };
  });

export const adminResetCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    customerId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    
    const { data: canAccess, error: accessError } = await supabase.rpc("can_access_customer", { 
      _customer: data.customerId 
    });

    if (accessError || !canAccess) {
      throw new Error("Unauthorized");
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("user_id")
      .eq("id", data.customerId)
      .single();
      
    if (customerError || !customer || !customer.user_id) throw new Error("Customer not found");

    const tempPassword = Math.random().toString(36).slice(-8);
    
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      customer.user_id,
      { password: tempPassword }
    );

    if (authError) throw authError;

    return { success: true, tempPassword };
  });
