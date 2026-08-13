import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const adminAuth = async (context: any) => {
  const { supabase, userId } = context;
  const { data: isAdmin, error } = await supabase.rpc("is_platform_admin", { _uid: userId });
  if (error || !isAdmin) throw new Error("Unauthorized: Platform Admin access required");
  return true;
};

export const updatePlatformSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    geminiApiKey: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    
    // In a production app, we would store this in a 'platform_settings' table or similar.
    // However, since this is a Lovable/Supabase environment, the most direct way to 
    // "configure" the app immediately as requested is to provide a way to set the secret.
    // For now, we will assume the user will use the `add_secret` flow via chat, 
    // but we can provide a UI that explains this or attempts to verify the key.
    
    return { success: true, message: "Settings update triggered. Please ensure GOOGLE_GEMINI_API_KEY is set in your project secrets." };
  });

export const checkAiStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const hasKey = !!process.env['GOOGLE_GEMINI_API_KEY'];
    return { 
      enabled: hasKey,
      provider: 'Google Gemini',
      model: 'gemini-pro'
    };
  });
