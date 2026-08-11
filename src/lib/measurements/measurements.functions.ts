import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getMeasurements = createServerFn({ method: "GET" })
  .inputValidator(z.object({ customerId: z.string() }).parse)
  .handler(async ({ data }) => {
    const { data: measurements, error } = await supabaseAdmin
      .from("measurements")
      .select("id, weight_kg, waist_cm, hip_cm, chest_cm, thigh_cm, arm_cm, created_at, taken_on")
      .eq("customer_id", data.customerId)
      .order("taken_on", { ascending: true });

    if (error) throw error;
    return measurements || [];
  });

export const addMeasurement = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    customerId: z.string(),
    weight_kg: z.number().nullable().optional(),
    waist_cm: z.number().nullable().optional(),
    hip_cm: z.number().nullable().optional(),
    chest_cm: z.number().nullable().optional(),
    thigh_cm: z.number().nullable().optional(),
    arm_cm: z.number().nullable().optional(),
    taken_on: z.string().optional(),
  }).parse)
  .handler(async ({ data }) => {
    const { customerId, ...rest } = data;
    const { error } = await supabaseAdmin
      .from("measurements")
      .insert({
        customer_id: customerId,
        taken_on: rest.taken_on || new Date().toISOString(),
        weight_kg: rest.weight_kg ?? null,
        waist_cm: rest.waist_cm ?? null,
        hip_cm: rest.hip_cm ?? null,
        chest_cm: rest.chest_cm ?? null,
        thigh_cm: rest.thigh_cm ?? null,
        arm_cm: rest.arm_cm ?? null,
      });
    if (error) throw error;
    return { success: true };
  });
