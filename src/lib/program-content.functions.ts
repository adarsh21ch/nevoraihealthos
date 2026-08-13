import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProgramContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .select("id, program_id")
      .eq("user_id", userId)
      .single();

    if (cErr || !customer) throw new Error("Customer not found");

    const { data: program } = await supabase
      .from("programs")
      .select("*")
      .eq("id", customer.program_id)
      .single();

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .order("sort_order");

    return { program, products };
  });
