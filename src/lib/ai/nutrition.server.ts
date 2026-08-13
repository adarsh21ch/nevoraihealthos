/**
 * Server-only helper for Gemini Nutrition AI integration.
 */

interface NutritionContext {
  geminiKey: string;
  customer: any;
  latestMeasurement?: any;
  activeProgram?: any;
}

export async function generateNutritionPlan({ geminiKey, customer, latestMeasurement, activeProgram }: NutritionContext) {
  const prompt = `
    You are the Fat2Fit AI Nutrition Coach. You generate personalized nutrition plans based on the Fat2Fit metabolic reset program (C9/DX4).
    
    Participant Profile:
    - Name: ${customer.name}
    - Gender: ${customer.gender || 'Not specified'}
    - Age: ${customer.age || 'Not specified'}
    - Lifestyle: ${customer.lifestyle || 'General'} (Affects meal timing and convenience)
    - Weight: ${latestMeasurement?.weight_kg || customer.weight_kg || 'Unknown'} kg
    - Goal: ${customer.goal || 'General Health'}
    - Diet Preference: ${customer.diet_preference || 'Standard'} (Vegetarian/Non-Veg/Vegan)
    - Allergies: ${customer.allergies || 'None'}
    
    Program Context:
    - Current Track: ${activeProgram?.track || 'standard'}
    - Program Name: ${activeProgram?.programs?.name || 'Fat2Fit Reset'}
    
    Rules:
    1. PRIORITIZE Indian eating patterns and foods (Dal, Paneer, Curd, Millets, Rice, Roti, Eggs, Chicken, etc.).
    2. Respect dietary preferences and allergies strictly.
    3. Adapt meal convenience to lifestyle (e.g., Student = quick/hostel-friendly; Office = carry-able; Homemaker = home-cooked).
    4. Provide 5 meal slots: Morning, Breakfast, Lunch, Snack, Dinner.
    5. Each meal MUST have: Name, Approved Foods, Portions, Protein (if applicable), and one Alternative.
    6. Portions must follow Fat2Fit C9/DX4 guidelines (approx. 600 cal for main meal if applicable).
    7. DO NOT invent medical advice.
    8. RETURN ONLY VALID JSON matching the specified structure.
    
    JSON Structure:
    {
      "plan_summary": "Short encouraging summary",
      "daily_targets": {
        "protein_g": 0,
        "calories": 0,
        "protein_note": "Note about the calculation source"
      },
      "meals": [
        {
          "id": "morning",
          "name": "Morning Ritual",
          "time": "07:30",
          "foods": ["Food 1", "Food 2"],
          "portion_guidance": "Instructions...",
          "protein_content": "X g",
          "alternative": "Substitute option",
          "notes": "Preparation tips"
        }
      ],
      "coach_notes": "Personalized advice for the participant",
      "lifestyle_adaptation": "How this plan fits their specific lifestyle"
    }
  `;

  return callGemini(geminiKey, prompt);
}

async function callGemini(apiKey: string, prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for structured output consistency
            response_mime_type: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty Gemini response");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Nutrition API Error:", error);
    // Return a fallback basic plan structure if AI fails
    return {
      plan_summary: "Your metabolic reset journey continues.",
      daily_targets: { protein_g: 0, calories: 0, protein_note: "Check program guide for targets." },
      meals: [],
      coach_notes: "Focus on hydration and consistency today."
    };
  }
}
