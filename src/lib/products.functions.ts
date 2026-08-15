import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    productId: z.string().uuid(),
    imagePath: z.string(),
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("is_app_admin", { _uid: userId });
    if (!isAdmin) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("products")
      .update({ image_url: data.imagePath })
      .eq("id", data.productId);

    if (error) throw error;
    return { success: true };
  });

export const getProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) throw error;
    return data;
  });
