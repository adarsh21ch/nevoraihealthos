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

    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .select("id, program_id")
      .eq("user_id", userId)
      .single();

    if (cErr || !customer) throw new Error("Customer not found");

    if (data.type === 'products') {
      const { data: items } = await supabase
        .from("day_tasks")
        .select("product_id, products(*)")
        .not("product_id", "is", null);

      return { state: 'success', data: items };
    }
    
    if (data.type === 'tips') {
       const { data: tips } = await supabase.from("tips").select("*").order("sort_order");
       return { state: tips?.length ? 'success' : 'no_content', data: tips };
    }

    if (data.type === 'faqs') {
       const { data: faqs } = await supabase.from("faqs").select("*").order("sort_order");
       return { state: faqs?.length ? 'success' : 'no_content', data: faqs };
    }

    throw new Error("Invalid content type");
  });
