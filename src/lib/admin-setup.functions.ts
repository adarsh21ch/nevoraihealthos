import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// This function will be called by the agent via dispatch when the user provides keys in chat
// OR by the UI if we build the interface.
export const saveSupabaseSecrets = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    supabaseUrl: z.string().url(),
    serviceRoleKey: z.string().min(20),
  }).parse(data))
  .handler(async ({ data }) => {
    // Note: We cannot call secrets--add_secret directly from inside a server function handler 
    // because tools are agent-only. 
    // Instead, we will use this function to verify the keys, and then I (the agent) 
    // will use the tool to save them.
    
    try {
      // Test the keys by creating a temporary client inside the handler
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(data.supabaseUrl, data.serviceRoleKey, {
        auth: { persistSession: false }
      });
      
      const { data: authUsers, error } = await testClient.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: "Keys validated successfully. I will now save them to the environment.",
        verified: true 
      };
    } catch (err: any) {
      console.error("Manual key validation failed:", err);
      throw new Error(`Validation failed: ${err.message}`);
    }
  });

export const testAdminConnection = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: "Admin client is connected and working.",
        userCount: data?.users?.length || 0
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.message 
      };
    }
  });
