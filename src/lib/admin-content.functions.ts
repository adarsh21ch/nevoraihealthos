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
      .select("id, code, name, summary, duration_days, next_program_code, sort_order")
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
    summary: z.string().nullable().optional(),
    duration_days: z.number().int().min(1),
    next_program_code: z.string().nullable().optional(),
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
      .select("id, name, short_name, how_to_use, image_url, video_url, sort_order, daily_use, kit_quantity, warnings")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2),
    short_name: z.string().nullable().optional(),
    how_to_use: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    video_url: z.string().nullable().optional(),
    sort_order: z.number().int().default(0),
    daily_use: z.string().nullable().optional(),
    kit_quantity: z.string().nullable().optional(),
    warnings: z.string().nullable().optional()
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
      .select("id, program_id, day_number, title, focus, tip, track, day_tasks(id, program_day_id, product_id, slot, sort_order, title, detail)")
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
    tip: z.string().nullable().optional(),
    track: z.string()
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

export const duplicateProgramDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ fromDayId: z.string().uuid(), toDayId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    await adminAuth(context);
    const { data: tasks, error: fetchError } = await context.supabase
      .from("day_tasks")
      .select("*")
      .eq("program_day_id", data.fromDayId);
    if (fetchError) throw fetchError;
    const newTasks = tasks.map(({ id, ...task }) => ({ ...task, program_day_id: data.toDayId }));
    const { error: insertError } = await context.supabase.from("day_tasks").insert(newTasks);
    if (insertError) throw insertError;
    return { success: true };
  });

export const saveDayTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    program_day_id: z.string().uuid(),
    product_id: z.string().uuid().nullable().optional(),
    slot: z.string(),
    title: z.string().min(1),
    detail: z.string().nullable().optional(),
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
      .select("id, body, day_number, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveTip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    body: z.string(),
    day_number: z.number().int().nullable().optional(),
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
      .select("id, question, answer, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  });

export const saveFAQ = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string().uuid().optional(),
    
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
