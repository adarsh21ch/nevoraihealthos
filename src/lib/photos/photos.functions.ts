import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PhotoResult = {
  state: 'success' | 'not_a_customer' | 'no_content' | 'error';
  message?: string;
  data?: any;
};

export const getProgressPhotos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ customerId: z.string() }).parse)
  .handler(async ({ data, context }): Promise<PhotoResult> => {
    try {
      const userId = context.userId;
      
      // Ownership check - RPC parameter is _customer according to build error
      const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
        _uid: userId, _customer: data.customerId
      });
      if (!allowed) return { state: 'not_a_customer' };

      const { data: photos, error } = await supabaseAdmin
        .from("progress_photos")
        .select("id, storage_path, taken_on, pose, share_consent, created_at")
        .eq("customer_id", data.customerId)
        .order("taken_on", { ascending: true });

      if (error) return { state: 'error', message: error.message };
      if (!photos || photos.length === 0) return { state: 'no_content', data: [] };
      
      // Generate signed URLs (1 hour expiry)
      const enrichedPhotos = await Promise.all(photos.map(async (photo) => {
        const { data: signed, error: signedError } = await supabaseAdmin.storage
          .from('progress-photos')
          .createSignedUrl(photo.storage_path, 3600);
          
        return {
          ...photo,
          photo_url: signed?.signedUrl || null,
          error: signedError?.message
        };
      }));
      
      return { state: 'success', data: enrichedPhotos };
    } catch (e: any) {
      return { state: 'error', message: e.message };
    }
  });

export const createProgressPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    customerId: z.string(),
    storagePath: z.string(),
    takenOn: z.string(),
    pose: z.enum(['front', 'side', 'back']),
  }).parse)
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    
    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: data.customerId
    });
    if (!allowed) return { success: false, error: 'Unauthorized' };

    const { error } = await supabaseAdmin
      .from("progress_photos")
      .insert({
        customer_id: data.customerId,
        storage_path: data.storagePath,
        taken_on: data.takenOn,
        pose: data.pose,
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
    const userId = context.userId;
    
    // Check ownership of the photo via customer
    const { data: photoData } = await supabaseAdmin
      .from('progress_photos')
      .select('customer_id')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) return { success: false, error: 'Photo not found' };

    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: photoData.customer_id
    });
    if (!allowed) return { success: false, error: 'Unauthorized' };

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
    const userId = context.userId;
    
    const { data: photoData } = await supabaseAdmin
      .from('progress_photos')
      .select('customer_id, storage_path')
      .eq('id', data.photoId)
      .single();
      
    if (!photoData) return { success: false, error: 'Photo not found' };

    const { data: allowed } = await supabaseAdmin.rpc('can_access_customer', {
      _uid: userId, _customer: photoData.customer_id
    });
    if (!allowed) return { success: false, error: 'Unauthorized' };

    // Delete storage object first
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

