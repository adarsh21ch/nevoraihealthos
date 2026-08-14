import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const adminAuth = async (context: any) => {
  const { supabase, userId } = context;
  const { data: isAdmin, error } = await supabase.rpc("is_platform_admin", { _uid: userId });
  if (error || !isAdmin) throw new Error("Unauthorized: Platform Admin access required");
  return true;
};

export const updateBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    logoUrl: z.string().url().optional().nullable(),
    bookletUrl: z.string().url().optional().nullable(),
    brandName: z.string().min(2).optional(),
    tagline: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { supabase } = context;

    const updateData: any = {};
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
    if (data.bookletUrl !== undefined) updateData.booklet_url = data.bookletUrl;
    if (data.brandName) updateData.brand_name = data.brandName;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;

    const { error } = await supabase
      .from('app_settings')
      .update(updateData)
      .eq('id', true);

    if (error) throw new Error(`Failed to update branding: ${error.message}`);
    return { success: true };
  });

export const updatePlatformSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    geminiApiKey: z.string().optional(),
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
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
