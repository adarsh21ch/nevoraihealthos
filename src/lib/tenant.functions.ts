import { createServerFn } from "@tanstack/react-start";

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
