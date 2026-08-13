import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProgressPhotos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    
    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: data.customerId
    });
    if (!allowed) throw new Error("Unauthorized");

    const { data: photos, error } = await supabaseAdmin
      .from("progress_photos")
      .select("*")
      .eq("customer_id", data.customerId)
      .order("taken_on", { ascending: true });

    if (error) throw error;
    
    const enrichedPhotos = await Promise.all((photos || []).map(async (photo) => {
      const { data: signed } = await supabaseAdmin.storage
        .from('progress-photos')
        .createSignedUrl(photo.storage_path, 3600);
        
      return {
        ...photo,
        photo_url: signed?.signedUrl || null,
      };
    }));
    
    return { state: 'success', data: enrichedPhotos };
  });

export const createProgressPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    customerId: z.string(),
    storagePath: z.string(),
    takenOn: z.string(),
    pose: z.enum(['front', 'side', 'back']),
    dayNumber: z.number().optional(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    
    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: data.customerId
    });
    if (!allowed) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("progress_photos")
      .insert({
        customer_id: data.customerId,
        storage_path: data.storagePath,
        taken_on: data.takenOn,
        pose: data.pose,
        day_number: data.dayNumber || 1,
        share_consent: false,
      });

    if (error) throw error;
    return { success: true };
  });

export const updatePhotoConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    photoId: z.string(),
    shareConsent: z.boolean(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    
    const { data: photoData } = await supabaseAdmin
      .from('progress_photos')
      .select('customer_id')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) throw new Error("Photo not found");

    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: photoData.customer_id
    });
    if (!allowed) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
      .from("progress_photos")
      .update({ share_consent: data.shareConsent })
      .eq("id", data.photoId);

    if (error) throw error;
    return { success: true };
  });

export const deleteProgressPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    photoId: z.string(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    
    const { data: photoData } = await supabaseAdmin
      .from('progress_photos')
      .select('customer_id, storage_path')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) throw new Error("Photo not found");

    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: photoData.customer_id
    });
    if (!allowed) throw new Error("Unauthorized");

    await supabaseAdmin.storage
      .from('progress-photos')
      .remove([photoData.storage_path]);

    const { error } = await supabaseAdmin
      .from("progress_photos")
      .delete()
      .eq("id", data.photoId);

    if (error) throw error;
    return { success: true };
  });
