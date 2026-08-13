import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface KnowledgeItem {
  id: string;
  type: string;
  category: string | null;
  program: 'C9' | 'DX4' | 'GENERAL' | null;
  title: string;
  content: string;
  tags: string[] | null;
  source: string | null;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED';
}

export const getKnowledgeItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    type: z.string().optional(),
    program: z.enum(['C9', 'DX4', 'GENERAL']).optional(),
    status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED']).optional()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    let query = supabase.from("knowledge_base").select("*");

    if (data?.type) query = query.eq("type", data.type);
    if (data?.program) query = query.eq("program", data.program);
    if (data?.status) query = query.eq("status", data.status);

    const { data: items, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return items as KnowledgeItem[];
  });

export const upsertKnowledgeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    type: z.string(),
    category: z.string().nullable().optional(),
    program: z.enum(['C9', 'DX4', 'GENERAL']).nullable().optional(),
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()).nullable().optional(),
    status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED']),
    metadata: z.any().optional()
  }).parse)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    
    // Security check: Only admins can manage knowledge
    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) throw new Error("Unauthorized: Admin access required");

    const upsertData: any = {
      title: data.title,
      content: data.content,
      type: data.type,
      status: data.status,
      created_by: userId,
      updated_at: new Date().toISOString()
    };

    if (data.id) upsertData.id = data.id;
    if (data.category !== undefined) upsertData.category = data.category;
    if (data.program !== undefined) upsertData.program = data.program;
    if (data.tags !== undefined) upsertData.tags = data.tags;
    if (data.metadata !== undefined) upsertData.metadata = data.metadata;

    const { data: item, error } = await supabase
      .from("knowledge_base")
      .upsert(upsertData)
      .select()
      .single();

    if (error) throw error;
    return item as KnowledgeItem;
  });
