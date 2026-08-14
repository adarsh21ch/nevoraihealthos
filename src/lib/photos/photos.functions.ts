import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProgressPhotos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    const { data: allowed } = await supabase.rpc('can_access_customer', {
      _customer: data.customerId
    });
    if (!allowed) throw new Error("Unauthorized");

    const { data: photos, error } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("customer_id", data.customerId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    const enrichedPhotos = await Promise.all((photos || []).map(async (photo) => {
      const { data: signed } = await supabase.storage
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
    dayNumber: z.number(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    const { data: allowed } = await supabase.rpc('can_access_customer', {
      _customer: data.customerId
    });
    if (!allowed) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("progress_photos")
      .insert({
        customer_id: data.customerId,
        storage_path: data.storagePath,
        day_number: data.dayNumber,
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
    const { supabase } = context;
    
    const { data: photoData } = await supabase
      .from('progress_photos')
      .select('customer_id')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) throw new Error("Photo not found");

    const { data: allowed } = await supabase.rpc('can_access_customer', {
      _customer: photoData.customer_id
    });
    if (!allowed) throw new Error("Unauthorized");

    const { error } = await supabase
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
    const { supabase } = context;
    
    const { data: photoData } = await supabase
      .from('progress_photos')
      .select('customer_id, storage_path')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) throw new Error("Photo not found");

    const { data: allowed } = await supabase.rpc('can_access_customer', {
      _customer: photoData.customer_id
    });
    if (!allowed) throw new Error("Unauthorized");

    await supabase.storage
      .from('progress-photos')
      .remove([photoData.storage_path]);

    const { error } = await supabase
      .from("progress_photos")
      .delete()
      .eq("id", data.photoId);

    if (error) throw error;
    return { success: true };
  });
