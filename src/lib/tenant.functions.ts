import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getTenantByHint = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    mode: z.enum(['slug', 'domain']),
    value: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    let query = supabaseAdmin
      .from('tenants')
      .select('id, slug, name, logo_url, primary_color, tagline, whatsapp, custom_domain');
      
    if (data.mode === 'slug') {
      query = query.eq('slug', data.value);
    } else {
      query = query.eq('custom_domain', data.value);
    }
    
    const { data: tenant, error } = await query.maybeSingle();
    
    if (error) {
      console.error("Error fetching tenant by hint:", error);
      return { tenant: null, error: error.message };
    }
    
    return { tenant };
  });
