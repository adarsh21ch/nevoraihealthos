/**
 * Shared Gemini AI caller for server-side functions.
 */

export interface GeminiAttempt {
  version: string;
  model: string;
}

export const GEMINI_FALLBACK_CHAIN: GeminiAttempt[] = [
  { version: 'v1', model: 'gemini-2.5-flash' },
  { version: 'v1', model: 'gemini-3.7-flash' },
  { version: 'v1', model: 'gemini-3.6-flash' },
  { version: 'v1', model: 'gemini-3.5-flash' },
];

export interface CallGeminiOptions {
  temperature?: number;
  responseMimeType?: string;
  maxOutputTokens?: number;
  logger?: (attempt: GeminiAttempt, error?: any, data?: any) => Promise<void>;
}

export async function callGeminiShared(
  apiKey: string,
  prompt: string,
  options: CallGeminiOptions = {}
): Promise<string> {
  const {
    temperature = 0.7,
    responseMimeType = "text/plain",
    maxOutputTokens = 1024,
    logger
  } = options;

  let lastError: any = null;

  for (const attempt of GEMINI_FALLBACK_CHAIN) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              topK: 40,
              topP: 0.95,
              maxOutputTokens,
              response_mime_type: responseMimeType,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error(`Gemini Shared Error (${attempt.model}):`, JSON.stringify(data.error));
        lastError = data.error;
        if (logger) await logger(attempt, data.error);
        continue;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        if (logger) await logger(attempt, null, data);
        return text;
      }
    } catch (error: any) {
      console.error(`Gemini Shared Fetch Error (${attempt.model}):`, error.message);
      lastError = error;
      if (logger) await logger(attempt, error);
    }
  }

  throw lastError || new Error("All Gemini models failed to respond.");
}
