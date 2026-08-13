import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Seeds the knowledge base with initial Fat2Fit program rules
 * This is an idempotent function for the initial setup.
 */
export const seedInitialKnowledge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Security check: Only admins can seed
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) throw new Error("Unauthorized: Admin access required");

    const initialKnowledge = [
      {
        type: 'C9',
        program: 'C9',
        title: 'C9 Daily Protocol Rules',
        content: `Day 1 & 2: Supplement focus. High hydration. 
Day 3-9: One 600-calorie meal per day (preferably lunch or dinner).
Shakes: Twice daily (Breakfast and Lunch or Dinner).
Movement: 30 mins low-impact exercise daily.`,
        status: 'APPROVED',
        tags: ['protocol', 'rules']
      },
      {
        type: 'NUTRITION',
        program: 'GENERAL',
        title: 'Indian Vegetarian Protein Sources',
        content: `1. Paneer (Low-fat preferred)
2. Moong Dal / Sprouts
3. Curd / Greek Yogurt
4. Soya Chunks (Limited quantity)
5. Chickpeas (Chana)
6. Kidney Beans (Rajma)`,
        status: 'APPROVED',
        tags: ['protein', 'vegetarian', 'indian']
      },
      {
        type: 'FOOD',
        program: 'GENERAL',
        title: 'Approved Free Foods (Unlimited)',
        content: `Vegetables: Cucumber, Celery, Spinach, Kale, Lettuce, Cauliflower, Broccoli.
Fruits (Limited): Green Apple, Berries.`,
        status: 'APPROVED',
        tags: ['free foods', 'vegetables']
      },
      {
        type: 'PROTEIN',
        program: 'GENERAL',
        title: 'Fat2Fit Protein Calculation Rules',
        content: `Standard calculation: 1.2g to 1.5g of protein per kg of TARGET weight.
Example: If target weight is 70kg, daily protein target is 84g to 105g.
Source: Fat2Fit Internal Nutrition Guidelines 2024.`,
        status: 'APPROVED',
        tags: ['calculation', 'protein']
      }
    ];


    for (const item of initialKnowledge) {
      await supabase.from('knowledge_base').upsert(item, { onConflict: 'title' });
    }

    return { success: true };
  });
