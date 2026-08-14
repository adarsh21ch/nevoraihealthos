/**
 * Server-only helper for Gemini Nutrition AI integration with Knowledge Grounding.
 */
import { getRelevantKnowledge, logAiGeneration } from "./knowledge.server";
import { callGeminiShared } from "./gemini-client.server";

interface NutritionContext {
  supabase: any;
  geminiKey: string;
  customer: any;
  latestMeasurement?: any;
  activeProgram?: any;
}

export async function generateNutritionPlan({ supabase, geminiKey, customer, latestMeasurement, activeProgram }: NutritionContext) {
  const programTrack = activeProgram?.track === 'DX4' ? 'DX4' : 'C9';
  
  // 1. Retrieve relevant program knowledge
  const knowledgeContext = await getRelevantKnowledge(supabase, {
    program: programTrack,
    dietPreference: customer.diet_preference,
    types: ['PROGRAM', 'NUTRITION', programTrack, 'FOOD', 'PROTEIN', 'C9_KIT']
  });

  const prompt = `
    You are the Fat2Fit AI Nutrition Coach. You generate personalized nutrition plans based ONLY on the approved Fat2Fit program knowledge provided.
    
    GROUNDING KNOWLEDGE:
    ${knowledgeContext}
    
    PARTICIPANT PROFILE:
    - Name: ${customer.name}
    - Gender: ${customer.gender || 'Not specified'}
    - Age: ${customer.age || 'Not specified'}
    - Lifestyle: ${customer.lifestyle || 'General'}
    - Activity Level: ${customer.activity_level || 'General'}
    - Height: ${customer.height_cm || 'Unknown'} cm
    - Weight: ${latestMeasurement?.weight_kg || customer.weight_kg || 'Unknown'} kg
    - Waist: ${latestMeasurement?.waist_cm || customer.waist_cm || 'Unknown'} cm
    - Goal: ${customer.goal || 'General Health'}
    - Diet Preference: ${customer.diet_preference || 'Standard'}
    - Allergies: ${customer.allergies?.join(', ') || 'None'}
    - Disliked Foods: ${customer.disliked_foods?.join(', ') || 'None'}
    - Cooking Access: ${customer.cooking_access || 'General'}
    - Meal Timing: ${customer.meal_timing ? JSON.stringify(customer.meal_timing) : 'Standard'}
    
    PROGRAM CONTEXT:
    - Track: ${programTrack}

    STRICT RULES FOR PRODUCTS:
    1. You MUST integrate the specific program supplements into the meal slots for EVERY day of the 9-day plan.
    2. For C9 (standard):
       - Morning Ritual: 2X Forever Garcinia Plus (wait 30 min), then 120ml Forever Aloe Vera Gel + 1X Forever Therm.
       - Breakfast: 1X Forever Lite Ultra (Shake), 1X Forever Fiber (taken separately with water).
       - Lunch: 2X Forever Garcinia Plus (wait 30 min), 120ml Forever Aloe Vera Gel + 1X Forever Therm.
       - Snack: 120ml Forever Aloe Vera Gel.
       - Dinner: 2X Forever Garcinia Plus (wait 30 min), 120ml Forever Aloe Vera Gel.
    3. Ensure the product names are exact and formatted clearly.

    3. Ensure the product names are exact: "Forever Aloe Vera Gel", "Forever Garcinia Plus", "Forever Lite Ultra", "Forever Therm", "Forever Fiber".

    4. Portions and timings MUST match the grounding knowledge for the current Day (Reset phase vs Build phase).
    5. DO NOT use generic AI knowledge for program rules. If a rule isn't in GROUNDING KNOWLEDGE, state: "Not available in approved knowledge base."
    2. Indian Diet Focus: Prioritize regional Indian eating patterns and ingredients found in the Indian market (Dal, Sabzi, Paneer, Roti, Curd, Poha). Ensure recipes use spices and items available in general Indian homes (Delhi/Urban focus).
    3. Diet Preferences (STRICT):
       - Vegetarian: No meat, no eggs, no fish.
       - Egg-Inclusive: No meat, no fish, but eggs allowed.
       - Non-Vegetarian: All allowed.
       - Vegan: No animal products (no dairy, no honey).
    4. Respect allergies strictly. Exclude those ingredients.
    5. Provide 5 meal slots: Morning Ritual, Breakfast, Lunch, Snack, Dinner.
    6. Each meal MUST have: Name, Approved Foods, Portions, Protein (if applicable), and one Alternative.
    7. Portions must follow ${programTrack} guidelines from Grounding Knowledge.
    8. DO NOT invent medical advice.
    9. RETURN ONLY VALID JSON.

    
    JSON Structure:
    {
      "plan_summary": "Short encouraging summary",
      "daily_targets": {
        "protein_g": 0,
        "calories": 0,
        "protein_note": "Note about calculation source"
      },
      "meals": [
        {
          "id": "morning",
          "name": "Morning Ritual",
          "foods": ["Food 1"],
          "portion_guidance": "Instructions...",
          "protein_content": "X g",
          "alternative": "Substitute option"
        }
      ],
      "knowledge_version": "1.0",
      "coach_notes": "Advice"
    }

    STRICT: You must provide all text fields in the JSON (plan_summary, foods, portion_guidance, coach_notes, etc.) in ${customer.preferred_language || 'English'} language.
  `;

  try {
    const text = await callGeminiShared(geminiKey, prompt, {
      temperature: 0.1,
      responseMimeType: "application/json",
      maxOutputTokens: 2048
    });

    const result = JSON.parse(text);
    
    // Log success
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id || customer.id,
      generation_type: 'NUTRITION_PLAN',
      model: 'gemini-fallback-chain',
      status: 'SUCCESS'
    });

    return result;
  } catch (error: any) {
    // Log failure
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id || customer.id,
      generation_type: 'NUTRITION_PLAN',
      model: 'gemini-fallback-chain',
      status: 'FAILURE',
      error_message: error.message
    });
    throw error;
  }
}

