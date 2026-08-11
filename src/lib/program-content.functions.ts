
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProgramContentResult = {
  state: 'success' | 'not_a_customer' | 'no_content' | 'error';
  message?: string;
  data?: any[];
};

export const getProgramContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    tenantSlug: z.string(),
    type: z.enum(['products', 'tips', 'faqs'])
  }).parse)
  .handler(async ({ context, data }): Promise<ProgramContentResult> => {
    const { supabase, userId } = context;

    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("id, tenant_id")
        .eq("user_id", userId)
        .single();
      
      if (!customer) return { state: 'not_a_customer' };

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("program_id")
        .eq("customer_id", customer.id)
        .eq("status", "active")
        .single();

      if (!enrollment) return { state: 'no_content' };

      if (data.type === 'products') {
        const { data: products, error } = await supabase
          .from("program_products")
          .select(`
            product_id,
            products (
              id, name, short_desc, image_url, video_url, why_in_program, how_to_use, common_mistakes
            )
          `)
          .eq("program_id", enrollment.program_id)
          .order("sort_order");
        
        if (error) return { state: 'error', message: error.message };
        if (!products || products.length === 0) return { state: 'no_content' };
        return { state: 'success', data: products };
      }

      if (data.type === 'tips') {
        const { data: tips, error } = await supabase
          .from("tips")
          .select("id, category, title, content")
          .order("category");
        
        if (error) return { state: 'error', message: error.message };
        if (!tips || tips.length === 0) return { state: 'no_content' };
        return { state: 'success', data: tips };
      }

      if (data.type === 'faqs') {
        const { data: faqs, error } = await supabase
          .from("faqs")
          .select("id, category, question, answer")
          .order("sort_order");
        
        if (error) return { state: 'error', message: error.message };
        if (!faqs || faqs.length === 0) return { state: 'no_content' };
        return { state: 'success', data: faqs };
      }

      return { state: 'success', data: [] };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });
