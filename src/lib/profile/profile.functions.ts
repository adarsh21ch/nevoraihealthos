import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ParticipantProfile {
  id: string;
  user_id: string | null;
  name: string;
  gender: string | null;
  age: number | null;
  dob: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  thigh_cm: number | null;
  goal: string | null;
  target_weight_kg: number | null;
  lifestyle: string | null;
  lifestyle_details: any | null;
  activity_level: string | null;
  diet_preference: string | null;
  allergies: string[] | null;
  disliked_foods: string[] | null;
  cooking_access: string | null;
  meal_timing: any | null;
  health_concerns: string | null;
  onboarding_complete: boolean;
  track: string | null;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return (data as unknown) as ParticipantProfile;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    name: z.string().optional(),
    gender: z.string().nullable().optional(),
    dob: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    height_cm: z.number().nullable().optional(),
    weight_kg: z.number().nullable().optional(),
    waist_cm: z.number().nullable().optional(),
    hip_cm: z.number().nullable().optional(),
    thigh_cm: z.number().nullable().optional(),
    goal: z.string().nullable().optional(),
    target_weight_kg: z.number().nullable().optional(),
    lifestyle: z.string().nullable().optional(),
    lifestyle_details: z.any().nullable().optional(),
    activity_level: z.string().nullable().optional(),
    diet_preference: z.string().nullable().optional(),
    allergies: z.array(z.string()).nullable().optional(),
    disliked_foods: z.array(z.string()).nullable().optional(),
    cooking_access: z.string().nullable().optional(),
    meal_timing: z.any().nullable().optional(),
    health_concerns: z.string().nullable().optional(),
    track: z.string().nullable().optional(),
    onboarding_complete: z.boolean().optional()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    
    // If DOB is provided, calculate age
    let finalData = { ...data };
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      finalData.age = age;
    }

    const { error } = await supabase
      .from("customers")
      .update(finalData as any)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  });

export const validateProfileReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) return { ready: false, missing: [{ field: 'name', label: 'Profile record', step: 0 }] };

    const missing = [];
    if (!profile.name) missing.push({ field: 'name', label: 'Name', step: 1 });
    if (!profile.dob) missing.push({ field: 'dob', label: 'Date of Birth', step: 1 });
    if (!profile.gender) missing.push({ field: 'gender', label: 'Gender', step: 1 });
    if (!profile.height_cm) missing.push({ field: 'height_cm', label: 'Height', step: 2 });
    if (!profile.weight_kg) missing.push({ field: 'weight_kg', label: 'Weight', step: 2 });
    if (!profile.waist_cm) missing.push({ field: 'waist_cm', label: 'Waist', step: 2 });
    if (!profile.goal) missing.push({ field: 'goal', label: 'Primary Goal', step: 3 });
    if (!profile.lifestyle) missing.push({ field: 'lifestyle', label: 'Lifestyle Type', step: 4 });
    if (!profile.activity_level) missing.push({ field: 'activity_level', label: 'Activity Level', step: 5 });
    if (!profile.diet_preference) missing.push({ field: 'diet_preference', label: 'Dietary Preference', step: 6 });
    if (!profile.cooking_access) missing.push({ field: 'cooking_access', label: 'Cooking Access', step: 8 });
    
    // Calculate completeness
    const totalFields = 11;
    const completeCount = totalFields - missing.length;
    const percent = Math.round((completeCount / totalFields) * 100);

    return {
      ready: missing.length === 0,
      missing,
      percent
    };
  });
