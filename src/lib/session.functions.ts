import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  consent: z.literal(true, {
    message: "Consent is required",
  }),
});

export const submitSessionRegistration = createServerFn({ method: "POST" })
  .inputValidator((data) => registrationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: registration, error: dbError } = await supabaseAdmin
      .from("session_registrations")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        consent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw new Error("Failed to register. Please try again.");

    // Send confirmation email via Resend
    const resendKey = process.env['RESEND_API_KEY'];
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        
        await resend.emails.send({
          from: 'Fat2Fit Wellness <wellness@nevorai.com>',
          to: data.email,
          subject: `Session Reserved - ${data.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #064E3B;">Spot Reserved!</h2>
              <p>Hello ${data.name},</p>
              <p>You've successfully registered for our upcoming wellness strategy session.</p>
              <div style="background: #F0FDF4; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p>We'll send you the joining link and calendar invite shortly before the session starts.</p>
              </div>
              <p>Get ready to transform your metabolic health.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;" />
              <p style="font-size: 12px; color: #6B7280;">Fat2Fit Wellness</p>
            </div>
          `
        });
      } catch (e) {
        console.error("Session registration email failed:", e);
      }
    }

    return registration;
  });

export const getSessionSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("session_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
      
    if (error) return null;
    return data;
  });

export const updateSessionSettings = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ next_session_at: z.string(), session_link: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check auth/role in production - for now we assume admin middleware if added
    
    const { data: settings, error } = await supabaseAdmin
      .from("session_settings")
      .upsert({ 
        id: (await supabaseAdmin.from('session_settings').select('id').limit(1).single()).data?.id || undefined,
        next_session_at: data.next_session_at, 
        session_link: data.session_link,
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();
      
    if (error) throw new Error("Failed to update settings.");
    return settings;
  });
