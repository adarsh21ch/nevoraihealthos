/**
 * Server-only RAG helper for Gemini Knowledge injection.
 */

interface KnowledgeQuery {
  program?: 'C9' | 'DX4';
  dietPreference?: string;
  types?: string[];
}

export async function getRelevantKnowledge(supabase: any, { program, dietPreference, types }: KnowledgeQuery) {
  let query = supabase
    .from("knowledge_base")
    .select("type, title, content, tags")
    .eq("status", "APPROVED");

  if (program) {
    query = query.or(`program.eq.${program},program.eq.GENERAL,program.is.null`);
  }

  if (types && types.length > 0) {
    query = query.in("type", types);
  }

  const { data, error } = await query.limit(20);
  if (error) {
    console.error("Knowledge retrieval error:", error);
    return "";
  }

  if (!data || data.length === 0) return "No specific program knowledge available.";

  return data.map((item: any) => `
    [TYPE: ${item.type}]
    [TITLE: ${item.title}]
    ${item.content}
    ---
  `).join("\n");
}

export async function logAiGeneration(supabase: any, logData: {
  distributor_id: string;
  participant_id: string;
  generation_type: string;
  model: string;
  status: 'SUCCESS' | 'FAILURE';
  error_message?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
}) {
  const { error } = await supabase
    .from("ai_generation_logs")
    .insert(logData);
    
  if (error) console.error("AI Logging Error:", error);
}
