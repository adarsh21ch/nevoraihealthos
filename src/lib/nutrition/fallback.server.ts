
/**
 * Scientific fallback nutrition plan generator for when AI fails.
 * Provides a balanced Indian-focused plan derived from C9/DX4 booklet standards.
 */

export interface FallbackPlanParams {
  customer: any;
  latestMeasurement?: any;
  programTrack: 'C9' | 'DX4';
}

export function generateFallbackNutritionPlan({ customer, latestMeasurement, programTrack }: FallbackPlanParams) {
  const weight = latestMeasurement?.weight_kg || customer.weight_kg || 70;
  const height = customer.height_cm || 170;
  const age = customer.age || 30;
  const gender = (customer.gender || 'male').toLowerCase();
  
  // 1. Calculate Targets
  let bmr = 0;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725
  };
  const factor = activityFactors[customer.activity_level] || 1.2;
  const tdee = Math.round(bmr * factor);
  
  // Program specific adjustments
  const calories = programTrack === 'C9' ? Math.max(1200, tdee - 500) : tdee;
  const proteinTarget = Math.round((customer.target_weight_kg || weight) * 1.3);

  // 2. Select Indian-focused Meals based on preference
  const isVeg = customer.diet_preference === 'Vegetarian' || customer.diet_preference === 'Vegan';
  
  return {
    plan_summary: `Your personalized ${programTrack} metabolic protocol, optimized for your ${customer.activity_level || 'standard'} lifestyle and ${customer.diet_preference || 'Standard'} preferences. Note: Generated using scientific guidelines while AI Coach was busy.`,
    daily_targets: {
      protein_g: proteinTarget,
      calories: calories,
      water_l: 3,
      protein_note: "Calculated at 1.3g per kg of target weight as per program guidelines."
    },
    meals: [
      {
        id: "morning",
        name: "Morning Ritual",
        foods: ["Warm Lemon Water", "Aloe Vera Gel (120ml)"],
        portion_guidance: "Consume immediately upon waking. Wait 30 minutes before breakfast.",
        protein_content: "0g",
        alternative: "Herbal tea (no sugar)"
      },
      {
        id: "breakfast",
        name: "Metabolic Breakfast",
        foods: isVeg ? ["Oats with Almonds & Flaxseeds", "1 Cup Curd (Plain)"] : ["2 Egg Whites", "1 Whole Egg", "Whole Wheat Toast"],
        portion_guidance: "High protein start to stabilize blood sugar.",
        protein_content: "15-20g",
        alternative: "Besan Chilla (2 medium) with green chutney"
      },
      {
        id: "lunch",
        name: "Strategic Lunch",
        foods: isVeg 
          ? ["Dal (1 bowl)", "Mixed Sabzi", "1 Bajra Roti", "Salad"] 
          : ["Grilled Chicken/Fish (150g)", "Small portion Brown Rice", "Steamed Broccoli"],
        portion_guidance: "Focus on fiber and lean protein. Half of your plate should be vegetables.",
        protein_content: "20-25g",
        alternative: "Paneer Bhurji (150g) with 1 small Roti"
      },
      {
        id: "snack",
        name: "Appetite Control",
        foods: ["Roasted Makhana (1 bowl)", "5-6 Walnuts"],
        portion_guidance: "Ideal for mid-evening cravings.",
        protein_content: "5g",
        alternative: "1 Seasonal Fruit (Apple/Pear)"
      },
      {
        id: "dinner",
        name: "Light Repair",
        foods: isVeg 
          ? ["Moong Dal Khichdi (small portion)", "Large Bowl of Soup"] 
          : ["Clear Chicken Soup", "Sautéed Vegetables"],
        portion_guidance: "Easy to digest meal before 8 PM.",
        protein_content: "10-15g",
        alternative: "Boiled Sprouts salad with lemon"
      }
    ],
    knowledge_version: "1.0-fallback",
    coach_notes: "This plan follows the core scientific principles of the C9 program. Focus on hydration and consistent timing for best results."
  };
}
