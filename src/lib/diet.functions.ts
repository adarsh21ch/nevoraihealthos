import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * C9 Diet Plan Logic
 * Based on Forever Living C9 Program guidelines.
 */

interface DietRequirement {
  id: string;
  name: string;
  slot: 'morning' | 'pre_lunch' | 'lunch' | 'evening' | 'pre_dinner' | 'dinner' | 'bedtime' | 'anytime';
  description: string;
  is_product: boolean;
  product_name?: string;
}

export const getDietPlan = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    age: z.number(),
    weight: z.number(),
    height: z.number(),
    gender: z.enum(['male', 'female', 'other']),
    programCode: z.string().optional().default('C9')
  }).parse(data))
  .handler(async ({ data }) => {
    // Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = 0;
    if (data.gender === 'male') {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
    } else {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    }

    // C9 is a calorie-restricted cleansing program. 
    // Usually 600 calories for the meal in Days 3-9.
    
    const day1and2: DietRequirement[] = [
      { id: '1', name: 'Aloe Vera Gel', slot: 'morning', description: '120ml with a glass of water', is_product: true, product_name: 'Aloe Vera Gel' },
      { id: '2', name: 'Forever Garcinia Plus', slot: 'morning', description: '2 softgels', is_product: true, product_name: 'Garcinia Plus' },
      { id: '3', name: 'Forever Fiber', slot: 'pre_lunch', description: '1 stick pack mixed with water', is_product: true, product_name: 'Forever Fiber' },
      { id: '4', name: 'Forever Garcinia Plus', slot: 'lunch', description: '2 softgels', is_product: true, product_name: 'Garcinia Plus' },
      { id: '5', name: 'Aloe Vera Gel', slot: 'lunch', description: '120ml with water', is_product: true, product_name: 'Aloe Vera Gel' },
      { id: '6', name: 'Forever Lite Ultra', slot: 'lunch', description: '1 scoop with 300ml water/milk', is_product: true, product_name: 'Forever Lite Ultra' },
      { id: '7', name: 'Forever Therm', slot: 'lunch', description: '1 tablet', is_product: true, product_name: 'Forever Therm' },
      { id: '8', name: 'Aloe Vera Gel', slot: 'dinner', description: '120ml with water', is_product: true, product_name: 'Aloe Vera Gel' },
      { id: '9', name: 'Forever Garcinia Plus', slot: 'dinner', description: '2 softgels', is_product: true, product_name: 'Garcinia Plus' },
    ];

    const day3to9: DietRequirement[] = [
      { id: '1', name: 'Aloe Vera Gel', slot: 'morning', description: '120ml with a glass of water', is_product: true, product_name: 'Aloe Vera Gel' },
      { id: '2', name: 'Forever Garcinia Plus', slot: 'morning', description: '2 softgels', is_product: true, product_name: 'Garcinia Plus' },
      { id: '3', name: 'Forever Fiber', slot: 'pre_lunch', description: '1 stick pack mixed with water', is_product: true, product_name: 'Forever Fiber' },
      { id: '10', name: 'Main Meal', slot: 'lunch', description: '600 calorie controlled meal (800 for men)', is_product: false },
      { id: '4', name: 'Forever Garcinia Plus', slot: 'dinner', description: '2 softgels', is_product: true, product_name: 'Garcinia Plus' },
      { id: '11', name: 'Aloe Vera Gel', slot: 'dinner', description: '120ml with water', is_product: true, product_name: 'Aloe Vera Gel' },
    ];

    return {
      bmr: Math.round(bmr),
      targetCalories: data.gender === 'male' ? 800 : 600,
      days1and2: day1and2,
      days3to9: day3to9,
      notice: "Always consult your doctor before starting a new diet program."
    };
  });
