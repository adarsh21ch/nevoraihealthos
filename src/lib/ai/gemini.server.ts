/**
 * Server-only helper for Gemini AI integration.
 * This file is excluded from the client bundle by the .server.ts extension.
 */

interface CoachContext {
  geminiKey: string;
  customer: any;
  logs: any[];
  measurements: any[];
}

/**
 * Generates a personalized coaching message using Gemini
 */
export async function generateCoachMessage({ geminiKey, customer, logs, measurements }: CoachContext) {
  const prompt = `
    You are an expert health coach for the "Fat2Fit" 9-day metabolic reset program.
    Your tone is premium, professional, encouraging, and slightly editorial.
    
    Participant Context:
    - Name: ${customer.name}
    - Track: ${customer.track} (Standard or DX4)
    - Current Goal: ${customer.goal || 'Wellness'}
    
    Recent Data:
    - Recent Logs: ${JSON.stringify(logs.slice(0, 2))}
    - Measurements: ${JSON.stringify(measurements)}
    
    Task: Write a short (2-3 sentence) personalized message for their dashboard. 
    Focus on their specific progress or offer a small tip relevant to their track.
    If it's their first few days, focus on adaptation. If later, focus on finish line discipline.
    Do not use placeholders. Speak directly to them.
  `;

  return callGemini(geminiKey, prompt);
}

/**
 * Handles interactive chat with the AI assistant
 */
export async function chatWithAi({ geminiKey, userMessage, customerName, track }: { 
  geminiKey: string; 
  userMessage: string; 
  customerName: string;
  track: string;
}) {
  const prompt = `
    You are the Fat2Fit AI Assistant. You help participants with their 9-day reset journey.
    User Name: ${customerName}
    Program Track: ${track}
    
    Rules:
    1. Be concise and professional.
    2. Answer questions about the C9/DX4 protocol.
    3. If they ask about medical issues, tell them to consult their doctor/GP.
    4. Focus on hydration, movement, and following the supplement schedule.
    
    User Question: ${userMessage}
  `;

  return callGemini(geminiKey, prompt);
}

/**
 * Low-level Gemini API caller
 */
async function callGemini(apiKey: string, prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Let's keep pushing towards your goals today!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Stay focused on your journey. Consistency is the key to results.";
  }
}
