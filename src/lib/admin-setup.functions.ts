import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const ensureAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    // 1. Get Admin Client
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { supabase } = await import("@/integrations/supabase/client");

    // 2. Check if user exists in Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let authUser = users.find((u: any) => u.email === data.email);

    if (!authUser) {
      console.log(`Creating new auth user: ${data.email}`);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.name }
      });
      if (createError) throw createError;
      authUser = newUser.user;
    } else {
      console.log(`Updating existing auth user: ${data.email}`);
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: data.password, email_confirm: true }
      );
      if (updateError) throw updateError;
    }

    if (!authUser) throw new Error("Failed to resolve auth user");

    // 3. Ensure platform_admin role
    const { error: roleError } = await (supabaseAdmin as any)
      .from("user_roles")
      .upsert({ 
        user_id: authUser.id, 
        role: 'platform_admin' 
      }, { onConflict: 'user_id,role' });
    
    if (roleError) console.error("Role upsert error:", roleError);

    // 4. Ensure platform_admins table entry
    const { error: adminTableError } = await (supabaseAdmin as any)
      .from("platform_admins")
      .upsert({ user_id: authUser.id }, { onConflict: 'user_id' });
    
    if (adminTableError) console.error("Platform admins table error:", adminTableError);

    // 5. Ensure customer profile
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", "fat2fit")
      .maybeSingle();

    if (tenant && (tenant as any).id) {
      const { error: customerError } = await (supabaseAdmin as any)
        .from("customers")
        .upsert({
          user_id: authUser.id,
          name: data.name,
          onboarding_complete: true,
          tenant_id: (tenant as any).id
        }, { onConflict: 'user_id' });
      if (customerError) console.error("Customer upsert error:", customerError);
    }

    return { success: true, email: data.email };
  });
