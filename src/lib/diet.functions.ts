import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDietPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    age: z.number(),
    height: z.number(),
    weight: z.number(),
    gender: z.enum(['male', 'female', 'other'])
  }).parse)
  .handler(async ({ data }) => {
    const bmr = data.gender === 'male' 
      ? 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
      : 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    
    const targetCalories = Math.round(bmr * 1.2); // Sedentary multiplier

    return {
      targetCalories,
      notice: "This is a base metabolic estimate. Follow the daily tasks in your Today view for the C9 protocol timing.",
      days3to9: [
        { id: '1', slot: 'morning', name: 'Aloe & Therm', description: '2 Garcinia, 1 Therm, 120ml Aloe, 1 Lite Ultra shake.', is_product: true },
        { id: '2', slot: 'mid_morning', name: 'Fiber', description: '1 Fiber packet in 300ml water.', is_product: true },
        { id: '3', slot: 'noon', name: 'Lunch Shake', description: '1 Lite Ultra shake, 1 Therm.', is_product: true },
        { id: '4', slot: 'evening', name: '600 Cal Meal', description: 'Your main balanced meal of the day.', is_product: false }
      ]
    };
  });
