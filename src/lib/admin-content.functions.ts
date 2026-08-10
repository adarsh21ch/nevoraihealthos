import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Platform Admin functions for managing global programs, products, and tenant status.
 */

const adminAuth = async (context: any) => {
  const { supabase, userId } = context;
  const { data: isAdmin, error } = await supabase.rpc("is_platform_admin", { _uid: userId });
  if (error || !isAdmin) throw new Error("Unauthorized: Platform Admin access required");
  return true;
};

// --- Programs ---

export const getAdminPrograms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await adminAuth(context);
    const { data, error } = await context.supabase
      .from("programs")
      .select("id, code, name, subtitle, duration_days, description, hero_image_url, next_program_code, sort_order, is_active")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveProgram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    code: z.string().min(2),
    name: z.string().min(2),
    subtitle: z.string().nullable().optional(),
    duration_days: z.number().int().min(1),
    description: z.string().nullable().optional(),
    hero_image_url: z.string().nullable().optional(),
    next_program_code: z.string().nullable().optional(),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true)
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("programs").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("programs").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });

// --- Products ---

export const getAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await adminAuth(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("id, code, name, short_desc, why_in_program, how_to_use, common_mistakes, image_url, video_url, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    code: z.string().min(2),
    name: z.string().min(2),
    short_desc: z.string().nullable().optional(),
    why_in_program: z.string().nullable().optional(),
    how_to_use: z.string().nullable().optional(),
    common_mistakes: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    video_url: z.string().nullable().optional(),
    sort_order: z.number().int().default(0)
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("products").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("products").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });

// --- Program Days & Tasks ---

export const getProgramDays = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ programId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { data: days, error } = await context.supabase
      .from("program_days")
      .select("id, program_id, day_number, title, focus, motivation, meal_guidance, tip, day_tasks(id, program_day_id, product_id, time_slot, suggested_time, title, dosage, instructions, is_optional, sort_order)")
      .eq("program_id", data.programId)
      .order("day_number", { ascending: true });
    if (error) throw error;
    return days;
  });

export const saveProgramDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    program_id: z.string().uuid(),
    day_number: z.number().int(),
    title: z.string().min(1),
    focus: z.string().nullable().optional(),
    motivation: z.string().nullable().optional(),
    meal_guidance: z.string().nullable().optional(),
    tip: z.string().nullable().optional()
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("program_days").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("program_days").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });

export const saveDayTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    program_day_id: z.string().uuid(),
    product_id: z.string().uuid().nullable().optional(),
    time_slot: z.string(),
    suggested_time: z.string().nullable().optional(),
    title: z.string().min(1),
    dosage: z.string().nullable().optional(),
    instructions: z.string().nullable().optional(),
    is_optional: z.boolean().default(false),
    sort_order: z.number().int().default(0)
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("day_tasks").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("day_tasks").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });

export const deleteDayTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { error } = await context.supabase.from("day_tasks").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

// --- Tips & FAQs ---

export const getAdminTips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await adminAuth(context);
    const { data, error } = await context.supabase
      .from("tips")
      .select("id, category, title, body, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveTip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    category: z.string(),
    title: z.string(),
    body: z.string(),
    sort_order: z.number().int()
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("tips").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("tips").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });

export const getAdminFAQs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await adminAuth(context);
    const { data, error } = await context.supabase
      .from("faqs")
      .select("id, category, question, answer, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveFAQ = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    category: z.string().nullable().optional(),
    question: z.string(),
    answer: z.string(),
    sort_order: z.number().int()
  }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { id, ...rest } = data;
    const updateData: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updateData[k] = v;
    }
    if (id) {
      const { error } = await context.supabase.from("faqs").update(updateData).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("faqs").insert(updateData);
      if (error) throw error;
    }
    return { success: true };
  });
