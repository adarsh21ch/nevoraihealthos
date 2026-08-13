-- Phase 6B: Knowledge Base & AI Governance (Final Revision)

-- 1. Knowledge Base Table
CREATE TABLE public.knowledge_base (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id uuid REFERENCES public.distributors(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN (
        'PROGRAM', 'NUTRITION', 'C9', 'DX4', 'C9_KIT', 
        'RECIPE', 'FOOD', 'PROTEIN', 'HYDRATION', 
        'MOVEMENT', 'LIFESTYLE', 'FAQ', 'VIDEO_TRANSCRIPT', 
        'COACH_GUIDANCE'
    )),
    category text,
    program text CHECK (program IN ('C9', 'DX4', 'GENERAL')),
    title text NOT NULL,
    content text NOT NULL,
    tags text[],
    source text,
    status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED')),
    metadata jsonb DEFAULT '{}',
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Nutrition Plans Table (Re-creating correctly since it was missing in inspection)
CREATE TABLE public.nutrition_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    distributor_id uuid REFERENCES public.distributors(id) ON DELETE CASCADE NOT NULL,
    version int NOT NULL DEFAULT 1,
    status text NOT NULL CHECK (status IN ('DRAFT', 'AI_GENERATED', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    plan_data jsonb NOT NULL,
    knowledge_version text,
    rule_version text,
    model_info text,
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamptz,
    changes_summary text,
    generated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. AI Generation Logs
CREATE TABLE public.ai_generation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id uuid REFERENCES public.distributors(id) ON DELETE CASCADE NOT NULL,
    participant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    generation_type text NOT NULL,
    model text NOT NULL,
    knowledge_version text,
    rule_version text,
    prompt_tokens int,
    completion_tokens int,
    status text NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
    safety_flags text[],
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- 4. Meal Logs
CREATE TABLE public.meal_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id uuid REFERENCES public.nutrition_plans(id) ON DELETE CASCADE NOT NULL,
    meal_id text NOT NULL,
    log_date date NOT NULL,
    status text NOT NULL CHECK (status IN ('COMPLETED', 'SUBSTITUTED', 'SKIPPED')),
    substitution_data jsonb,
    completed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE (participant_id, log_date, meal_id)
);

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;
GRANT ALL ON public.knowledge_base TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_plans TO authenticated;
GRANT ALL ON public.nutrition_plans TO service_role;

GRANT SELECT, INSERT ON public.ai_generation_logs TO authenticated;
GRANT ALL ON public.ai_generation_logs TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_logs TO authenticated;
GRANT ALL ON public.meal_logs TO service_role;

-- 6. RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Knowledge Base Policies
CREATE POLICY "Anyone authenticated can view approved knowledge" ON public.knowledge_base
    FOR SELECT TO authenticated USING (status = 'APPROVED' OR distributor_id IS NULL OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Nutrition Plans Policies
CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans
    FOR SELECT TO authenticated USING (auth.uid() = participant_id);

CREATE POLICY "Coaches can view their participants plans" ON public.nutrition_plans
    FOR SELECT TO authenticated USING (EXISTS (
        SELECT 1 FROM public.distributors d 
        WHERE d.id = nutrition_plans.distributor_id AND d.user_id = auth.uid()
    ));

-- AI Logs Policies
CREATE POLICY "Admins can view all AI logs" ON public.ai_generation_logs
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Meal Logs Policies
CREATE POLICY "Users can manage own meal logs" ON public.meal_logs
    FOR ALL TO authenticated USING (auth.uid() = participant_id);

-- 7. Indexes
CREATE INDEX idx_kb_type_status ON public.knowledge_base(type, status);
CREATE INDEX idx_nutrition_plans_participant ON public.nutrition_plans(participant_id, status);
CREATE INDEX idx_ai_logs_participant ON public.ai_generation_logs(participant_id);
CREATE INDEX idx_meal_logs_date ON public.meal_logs(log_date);
