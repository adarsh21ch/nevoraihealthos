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

    // TODO: Send confirmation email via Resend
    // ...

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
