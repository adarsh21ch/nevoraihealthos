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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const bmr = data.gender === 'male' 
      ? 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
      : 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    
    const targetCalories = Math.round(bmr * 1.2);

    // Fetch Indian recipes
    const { data: recipes } = await supabaseAdmin
      .from("recipes")
      .select("name, calories, ingredients, instructions")
      .eq("category", "600_cal")
      .limit(3);

    return {
      targetCalories,
      notice: "Follow the C9 protocol timings strictly. Use these Indian meal options for your 600-cal window.",
      recipes: recipes || [],
      days3to9: [
        { id: '1', slot: 'morning', name: 'Morning Protocol', description: '2 Garcinia + 1 Therm (wait 30m) → 120ml Aloe + 1 scoop Lite Ultra.', is_product: true },
        { id: '2', slot: 'mid_morning', name: 'Fiber Boost', description: '1 Fiber packet in 300ml water. Take separately from nutrients.', is_product: true },
        { id: '3', slot: 'noon', name: 'Midday Fuel', description: '2 Garcinia + 1 Therm (wait 30m) → 1 scoop Lite Ultra.', is_product: true },
        { id: '4', slot: 'early_evening', name: '600 Cal Meal', description: 'Choose one from the suggested Indian meal set below.', is_product: false }
      ]
    };
  });
