/**
 * Server-only helper for Gemini AI integration.
 * This file is excluded from the client bundle by the .server.ts extension.
 */
import { callGeminiShared } from "./gemini-client.server";
import { logAiGeneration } from "./knowledge.server";

interface CoachContext {
  supabase: any; // Added for logging
  geminiKey: string;
  customer: any;
  logs: any[];
  measurements: any[];
}

/**
 * Generates a personalized coaching message using Gemini
 */
export async function generateCoachMessage({ supabase, geminiKey, customer, logs, measurements }: CoachContext) {
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
    STRICT: You must provide the response in ${customer.preferred_language || 'English'} language.
  `;

  try {
    const text = await callGeminiShared(geminiKey, prompt, {
      temperature: 0.8,
      maxOutputTokens: 256
    });

    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id || customer.id,
      generation_type: 'COACH_MESSAGE',
      model: 'gemini-fallback-chain',
      status: 'SUCCESS'
    });

    return text;
  } catch (error: any) {
    console.error("Coach message generation failed:", error);
    await logAiGeneration(supabase, {
      distributor_id: customer.distributor_id,
      participant_id: customer.user_id || customer.id,
      generation_type: 'COACH_MESSAGE',
      model: 'gemini-fallback-chain',
      status: 'FAILURE',
      error_message: error.message
    });
    // Return a user-friendly error state instead of silent fallback
    return "Your AI Coach is momentarily resting. Please refresh or try again shortly to get your personalized update.";
  }
}

/**
 * Handles interactive chat with the AI assistant
 */
export async function chatWithAi({ supabase, geminiKey, userMessage, customerName, track, customerId, distributorId, preferredLanguage }: { 
  supabase: any;
  geminiKey: string; 
  userMessage: string; 
  customerName: string;
  track: string;
  customerId?: string;
  distributorId?: string;
  preferredLanguage?: string;
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
    STRICT: You must respond in ${preferredLanguage || 'English'} language.
  `;

  try {
    const text = await callGeminiShared(geminiKey, prompt, {
      temperature: 0.7,
      maxOutputTokens: 512
    });

    if (customerId && distributorId) {
      await logAiGeneration(supabase, {
        distributor_id: distributorId,
        participant_id: customerId,
        generation_type: 'CHAT',
        model: 'gemini-fallback-chain',
        status: 'SUCCESS'
      });
    }

    return text;
  } catch (error: any) {
    console.error("AI Chat failed:", error);
    if (customerId && distributorId) {
      await logAiGeneration(supabase, {
        distributor_id: distributorId,
        participant_id: customerId,
        generation_type: 'CHAT',
        model: 'gemini-fallback-chain',
        status: 'FAILURE',
        error_message: error.message
      });
    }
    return "I'm having trouble connecting to my knowledge base right now. Please try your question again in a moment.";
  }
}

