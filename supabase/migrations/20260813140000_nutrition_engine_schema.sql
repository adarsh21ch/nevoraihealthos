-- 1. Create nutrition_plans table
CREATE TABLE public.nutrition_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    version int NOT NULL DEFAULT 1,
    status text NOT NULL CHECK (status IN ('DRAFT', 'AI_GENERATED', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    plan_data jsonb NOT NULL,
    generated_at timestamptz DEFAULT now(),
    model_info text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create meal_logs table
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

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_plans TO authenticated;
GRANT ALL ON public.nutrition_plans TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_logs TO authenticated;
GRANT ALL ON public.meal_logs TO service_role;

-- 4. RLS
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition plans" ON public.nutrition_plans
    FOR SELECT TO authenticated USING (auth.uid() = participant_id);

CREATE POLICY "Users can manage own meal logs" ON public.meal_logs
    FOR ALL TO authenticated USING (auth.uid() = participant_id);

CREATE INDEX idx_nutrition_plans_participant ON public.nutrition_plans(participant_id, status);
CREATE INDEX idx_meal_logs_participant_date ON public.meal_logs(participant_id, log_date);
