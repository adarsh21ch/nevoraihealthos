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
export async function chatWithAi({ supabase, geminiKey, userMessage, customerName, track }: { 
  supabase: any;
  geminiKey: string; 
  userMessage: string; 
  customerName: string;
  track: string;
}) {
  // 1. Retrieve relevant knowledge for the chat
  const { getRelevantKnowledge } = await import("./knowledge.server");
  const knowledgeContext = await getRelevantKnowledge(supabase, {
    program: track === 'DX4' ? 'DX4' : 'C9',
    types: ['PROGRAM', 'NUTRITION', 'FAQ', 'FOOD', 'PROTEIN']
  });

  const prompt = `
    You are the Fat2Fit AI Assistant. You help participants with their journey.
    User Name: ${customerName}
    Program Track: ${track}
    
    FAT2FIT KNOWLEDGE BASE:
    ${knowledgeContext}
    
    RULES:
    1. Answer ONLY based on the Fat2Fit Knowledge Base provided above.
    2. If the information is not in the Knowledge Base, say: "I don't have that information in my Fat2Fit program guide. Please check with your coach."
    3. Be concise and professional.
    4. Focus on hydration, movement, and program compliance.
    5. If they ask about medical issues, tell them to consult their doctor.
    
    USER QUESTION: ${userMessage}
  `;

  return callGemini(geminiKey, prompt);
}

/**
 * Low-level Gemini API caller
 */
async function callGemini(apiKey: string, prompt: string) {
  // Try multiple model endpoints to ensure maximum compatibility
  const endpoints = [
    { version: 'v1', model: 'gemini-1.5-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash' },
    { version: 'v1', model: 'gemini-pro' } // Backup if flash fails
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${endpoint.version}/models/${endpoint.model}:generateContent?key=${apiKey}`,
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
      
      if (data.error) {
        console.error(`Gemini API Error (${endpoint.model} ${endpoint.version}):`, data.error);
        lastError = data.error;
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (error) {
      console.error(`Gemini Fetch Error (${endpoint.model}):`, error);
      lastError = error;
    }
  }

  return "Let's keep pushing towards your goals today! Stay focused on your journey.";
}
