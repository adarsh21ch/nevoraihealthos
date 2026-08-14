import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getAccessCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: 'admin' });
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: 'tenant_owner' });
    
    if (!isAdmin && !isOwner) throw new Error("Unauthorized");

    let query = supabase
      .from("access_codes")
      .select("id, code, created_at, used_at, coach_id");

    if (!isAdmin && isOwner) {
      query = query.eq("coach_id", userId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  });

export const generateAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ code: z.string() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: 'admin' });
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: 'tenant_owner' });
    
    if (!isAdmin && !isOwner) throw new Error("Unauthorized");

    const insertData: any = { code: data.code };
    if (!isAdmin && isOwner) {
      insertData.coach_id = userId;
    }

    const { error } = await supabase.from("access_codes").insert(insertData);
    if (error) throw error;
    return { success: true };
  });

export const deleteAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: 'admin' });
    const { data: isOwner } = await supabase.rpc("has_role", { _user_id: userId, _role: 'tenant_owner' });
    
    if (!isAdmin && !isOwner) throw new Error("Unauthorized");

    let query = supabase.from("access_codes").delete().eq("id", data.id);
    
    if (!isAdmin && isOwner) {
      query = query.eq("coach_id", userId);
    }

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  });
