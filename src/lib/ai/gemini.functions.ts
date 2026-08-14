import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server function to get a personalized AI coaching message
 */
export const getCoachInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const geminiKey = process.env['GOOGLE_GEMINI_API_KEY'];

    if (!geminiKey) {
      return { 
        message: "Your AI Coach is currently off-duty. Please contact support to enable the Gemini integration.",
        status: 'no_key'
      };
    }

    try {
      // 1. Get detailed context for the AI
      const [customerRes, logsRes, measurementsRes] = await Promise.all([
        supabase.from("customers").select("*, programs(name, code)").eq("user_id", userId).single(),
        supabase.from("daily_logs").select("*").eq("customer_id", userId).order("log_date", { ascending: false }).limit(3),
        supabase.from("measurements").select("*").eq("customer_id", userId).order("day_number", { ascending: true })
      ]);

      const customer = customerRes.data;
      if (!customer) throw new Error("Customer not found");

      // Import the server helper dynamically to keep it out of the client bundle
      const { generateCoachMessage } = await import("./gemini.server");

      const message = await generateCoachMessage({
        supabase,
        geminiKey,
        customer,
        logs: logsRes.data || [],
        measurements: measurementsRes.data || []
      });

      return { message, status: 'success' };
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      return { 
        message: "I'm having a bit of trouble connecting to your data. Let's keep focused on your goals for today!", 
        status: 'error' 
      };
    }
  });

/**
 * Server function for the AI Chat interface
 */
export const askAiAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    message: z.string(),
    context: z.string().optional()
  }).parse(data))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const geminiKey = process.env['GOOGLE_GEMINI_API_KEY'];

    if (!geminiKey) throw new Error("Gemini API Key not configured");

    const { chatWithAi } = await import("./gemini.server");
    
    // Get basic context
    const { data: customer } = await supabase
      .from("customers")
      .select("name, track, program_id, preferred_language, distributor_id")
      .eq("user_id", userId)
      .single();

    const response = await chatWithAi({
      supabase,
      geminiKey,
      userMessage: data.message,
      customerName: customer?.name || "Participant",
      track: (customer as any)?.track || "standard",
      customerId: userId,
      distributorId: (customer as any)?.distributor_id,
      preferredLanguage: (customer as any)?.preferred_language
    });

    return { response };
  });
