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
    - Weight: ${latestMeasurement?.weight_kg || customer.weight_kg || 'Unknown'} kg
    - Goal: ${customer.goal || 'General Health'}
    - Diet Preference: ${customer.diet_preference || 'Standard'}
    - Allergies: ${customer.allergies || 'None'}
    
    PROGRAM CONTEXT:
    - Track: ${programTrack}
    
    STRICT RULES:
    1. DO NOT use generic AI knowledge for program rules. If a rule isn't in GROUNDING KNOWLEDGE, state: "Not available in approved knowledge base."
    2. PRIORITIZE Indian eating patterns and foods found in the food list.
    3. Respect dietary preferences and allergies strictly.
    4. Provide 5 meal slots: Morning, Breakfast, Lunch, Snack, Dinner.
    5. Each meal MUST have: Name, Approved Foods, Portions, Protein (if applicable), and one Alternative.
    6. Portions must follow ${programTrack} guidelines from Grounding Knowledge.
    7. DO NOT invent medical advice.
    8. RETURN ONLY VALID JSON.
    
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
      model: 'gemini-1.5-pro',
      status: 'SUCCESS'
    });

    return result;
  } catch (error: any) {
    // Log failure
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id,
      generation_type: 'NUTRITION_PLAN',
      model: 'gemini-1.5-pro',
      status: 'FAILURE',
      error_message: error.message
    });
    throw error;
  }
}

async function callGemini(apiKey: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Minimal creativity for strict grounding
          response_mime_type: "application/json",
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  
  return JSON.parse(text);
}
