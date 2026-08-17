import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGeminiShared } from "./ai/gemini-client.server";

const bmiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1).max(120),
  gender: z.string(),
  height_cm: z.number().min(100).max(250),
  weight_kg: z.number().min(25).max(300),
  activity_level: z.string(),
  goal: z.string(),
  consent: z.literal(true, {
    message: "Consent is required",
  }),
  self_score_data: z.any().optional(),
  warning_signs_count: z.number().optional(),
});


export const submitBmiLead = createServerFn({ method: "POST" })
  .inputValidator((data) => bmiSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // 1. Calculate BMI
    const heightM = data.height_cm / 100;
    const bmiValue = parseFloat((data.weight_kg / (heightM * heightM)).toFixed(1));
    
    // 2. Determine Category (Asian-Pacific WHO)
    let bmiCategory = "";
    if (data.age < 18) {
      bmiCategory = "Paediatric (Specialist Consultation Recommended)";
    } else {
      if (bmiValue < 18.5) bmiCategory = "Underweight";
      else if (bmiValue < 23.0) bmiCategory = "Normal";
      else if (bmiValue < 25.0) bmiCategory = "Overweight";
      else bmiCategory = "Obese";
    }

    // 3. Save to DB
    const { data: lead, error: dbError } = await supabaseAdmin
      .from("bmi_leads")
      .insert({
        name: data.name,
        email: data.email,
        age: data.age,
        gender: data.gender,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        activity_level: data.activity_level,
        goal: data.goal,
        bmi_value: bmiValue,
        bmi_category: bmiCategory,
        consent_at: new Date().toISOString(),
        self_score_data: data.self_score_data,
        warning_signs_count: data.warning_signs_count,
      })
      .select()
      .single();

    if (dbError) {
      console.error("BMI lead save error:", dbError);
      throw new Error("Failed to save your result. Please try again.");
    }

    // 4. Async AI Report & Email
    if (data.age >= 18) {
      // Fire and forget (or handle in background)
      processBmiReport(lead.id, data, bmiValue, bmiCategory).catch(console.error);
    }

    return {
      bmiValue,
      bmiCategory,
      healthyRange: {
        min: parseFloat((18.5 * heightM * heightM).toFixed(1)),
        max: parseFloat((22.9 * heightM * heightM).toFixed(1)),
      }
    };
  });

async function processBmiReport(leadId: string, data: any, bmiValue: number, bmiCategory: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const geminiKey = process.env['GOOGLE_GEMINI_API_KEY'];
  const resendKey = process.env['RESEND_API_KEY'];

  let reportText = "";

  if (geminiKey) {
    const prompt = `
      You are a professional wellness assistant. Generate a personalized wellness summary for a user based on their BMI result.
      
      USER DATA:
      Name: ${data.name}
      Age: ${data.age}
      Gender: ${data.gender}
      BMI: ${bmiValue} (${bmiCategory})
      Activity Level: ${data.activity_level}
      Primary Goal: ${data.goal}

      STRICT REQUIREMENTS:
      1. No diagnosis, no medical advice, no treatment recommendations.
      2. NEVER mention or recommend any supplement, product, or brand (no Forever Living, no C9, no Garcinia, etc.).
      3. Do not promise weight-loss amounts or timeframes.
      4. Use a non-shaming, encouraging tone. No language about willpower or blame.
      5. MUST include exactly this sentence: "This is general wellness information, not medical advice. Consult a qualified doctor before starting any diet or exercise programme, especially if you have a medical condition, are pregnant, or take medication."
      6. If BMI is clinical concern (< 16 or >= 35), recommend seeing a doctor as the primary suggestion.
      7. Keep it concise (2-3 short paragraphs).
    `;

    try {
      reportText = await callGeminiShared(geminiKey, prompt, { temperature: 0.5 });
      
      await supabaseAdmin
        .from("bmi_leads")
        .update({ report_text: reportText })
        .eq("id", leadId);
    } catch (e) {
      console.error("AI Report generation failed:", e);
      reportText = "Your personalized wellness report is being prepared and will be sent to your email shortly.";
    }
  }

  if (resendKey && reportText) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      
      await resend.emails.send({
        from: 'Fat2Fit Wellness <wellness@nevorai.com>',
        to: data.email,
        subject: `Your Wellness Report - ${data.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #064E3B;">Hello ${data.name},</h2>
            <p>Thank you for using our BMI & Wellness screening tool. Here are your results:</p>
            <div style="background: #F0FDF4; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <p><strong>BMI:</strong> ${bmiValue}</p>
              <p><strong>Category:</strong> ${bmiCategory}</p>
            </div>
            <div style="line-height: 1.6; color: #374151;">
              ${reportText.replace(/\n/g, '<br/>')}
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
            <p style="font-size: 12px; color: #6B7280;">
              Fat2Fit Wellness | This is a generated report based on your inputs.
            </p>
          </div>
        `
      });

      await supabaseAdmin
        .from("bmi_leads")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", leadId);
    } catch (e) {
      console.error("Email delivery failed:", e);
    }
  }
}
