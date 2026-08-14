/**
 * Server-only helper for Gemini Nutrition AI integration with Knowledge Grounding.
 */
import { getRelevantKnowledge, logAiGeneration } from "./knowledge.server";

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

    
    CALCULATION METHODOLOGY:
    1. Basal Metabolic Rate (BMR) Estimation:
       - Use Mifflin-St Jeor: 
         - Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
         - Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
    2. Total Daily Energy Expenditure (TDEE): 
       - Multiply BMR by Activity Factor (sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725).
    3. Program Targets:
       - C9: Weight loss focus, typically 1200-1500 kcal for women, 1500-1800 kcal for men, but personalized based on TDEE (approx 500 kcal deficit).
       - DX4: Metabolism reset focus, prioritize nutrient density over aggressive calorie cutting.
    4. Protein Target:
       - Minimum 1.2g to 1.5g per kg of target weight. Use Target Weight (${customer.target_weight_kg || 'Current Weight'} kg) to calculate.

    STRICT RULES:
    1. DO NOT use generic AI knowledge for program rules. If a rule isn't in GROUNDING KNOWLEDGE, state: "Not available in approved knowledge base."
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
  `;

  try {
    const result = await callGemini(geminiKey, prompt);
    
    // Log success
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id,
      generation_type: 'NUTRITION_PLAN',
      model: 'gemini-1.5-flash',
      status: 'SUCCESS'
    });

    return result;
  } catch (error: any) {
    // Log failure
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id,
      generation_type: 'NUTRITION_PLAN',
      model: 'gemini-1.5-flash',
      status: 'FAILURE',
      error_message: error.message
    });
    throw error;
  }
}

async function callGemini(apiKey: string, prompt: string) {
  // Use v1beta for better model availability if v1 fails, but try v1 first for stability
  const apiVersions = ['v1', 'v1beta'];
  let lastError = null;

  for (const version of apiVersions) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json",
            },
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) {
        console.error(`Gemini API error (${version}):`, data.error);
        lastError = new Error(`Gemini API error (${version}): ${data.error.message || "Unknown error"}`);
        // If it's a model not found error, try next version
        if (data.error.status === 'NOT_FOUND' || data.error.message?.includes('not found')) {
          continue;
        }
        throw lastError;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error(`Empty Gemini response (${version}):`, JSON.stringify(data, null, 2));
        continue;
      }
      
      return JSON.parse(text);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini attempt with ${version} failed:`, err.message);
    }
  }

  throw lastError || new Error("Gemini API call failed after multiple attempts");
}
