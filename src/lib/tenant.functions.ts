import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: settings, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching app settings:", error);
      return { settings: null, error: error.message };
    }
    
    return { settings };
  });

export const getTenantByHint = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    mode: z.enum(['slug', 'domain']),
    value: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: tenant, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle();
      
    if (error) {
      return { tenant: null, error: error.message };
    }
    
    // Mock a tenant object for compatibility
    return { 
      tenant: {
        id: 'fat2fit-id',
        slug: 'fat2fit',
        name: tenant?.brand_name || 'Fat2Fit',
        tagline: tenant?.tagline,
        primary_color: '#16a34a',
        logo_url: null
      }
    };
  });
