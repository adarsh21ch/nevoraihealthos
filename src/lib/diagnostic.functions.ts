import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const runAdminDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    email: z.string().email(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // 1. Get user by email
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email === data.email);
    
    if (!user) {
      return { status: 'error', message: `User ${data.email} not found in Auth` };
    }

    // 2. Check roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    return {
      status: 'success',
      userId: user.id,
      roles: roles || [],
      rolesError
    };
  });
