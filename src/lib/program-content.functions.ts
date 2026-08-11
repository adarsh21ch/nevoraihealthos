import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProgramContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    tenantSlug: z.string(),
    type: z.enum(['products', 'tips', 'faqs'])
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: customer } = await supabase
      .from("customers")
      .select("id, tenant_id")
      .eq("user_id", userId)
      .single();
    
    if (!customer) throw new Error("Customer not found");

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("program_id")
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .single();

    if (!enrollment) throw new Error("No active enrollment");

    if (data.type === 'products') {
      const { data: products } = await supabase
        .from("program_products")
        .select(`
          product_id,
          products (
            id, name, short_desc, image_url, video_url, why_in_program, how_to_use, common_mistakes
          )
        `)
        .eq("program_id", enrollment.program_id)
        .order("sort_order");
      return products;
    }

    if (data.type === 'tips') {
      const { data: tips } = await supabase
        .from("tips")
        .select("id, category, title, content")
        .order("category");
      return tips;
    }

    if (data.type === 'faqs') {
      const { data: faqs } = await supabase
        .from("faqs")
        .select("id, category, question, answer")
        .order("sort_order");
      return faqs;
    }

    return [];
  });
