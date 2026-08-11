import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getMeasurements = createServerFn({ method: "GET" })
  .inputValidator(z.object({ enrollmentId: z.string() }).parse)
  .handler(async ({ data }) => {
    const { data: measurements, error } = await supabaseAdmin
      .from("customer_measurements")
      .select("id, weight_kg, waist_cm, hip_cm, chest_cm, thigh_cm, arm_cm, created_at, taken_on")
      .eq("customer_id", data.enrollmentId) // Changed from enrollment_id to customer_id which is the actual FK for measurements
      .order("taken_on", { ascending: true });

    if (error) throw error;
    return measurements;
  });

export const addMeasurement = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    enrollmentId: z.string(),
    weight_kg: z.number().optional(),
    waist_cm: z.number().optional(),
    hip_cm: z.number().optional(),
    chest_cm: z.number().optional(),
    thigh_cm: z.number().optional(),
    arm_cm: z.number().optional(),
  }).parse)
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("measurements")
      .insert({
        customer_id: data.enrollmentId, // Assuming customer_id for now as FK
        taken_on: new Date().toISOString(),
        ...data,
      });
    if (error) throw error;
    return { success: true };
  });
