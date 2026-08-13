-- 1. Create Role System
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'participant');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Create Participant Programs (Tracking active journeys)
CREATE TABLE IF NOT EXISTS public.participant_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    track TEXT, -- 'standard', 'dx4_first', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    coach_id UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE ON public.participant_programs TO authenticated;
GRANT ALL ON public.participant_programs TO service_role;

ALTER TABLE public.participant_programs ENABLE ROW LEVEL SECURITY;

-- 3. Migration logic for existing task_completions
-- Check if column exists first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='task_completions' AND column_name='participant_program_id') THEN
        ALTER TABLE public.task_completions ADD COLUMN participant_program_id UUID REFERENCES public.participant_programs(id);
    END IF;
END $$;

-- 4. RLS for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. RLS for participant_programs
CREATE POLICY "Participants can view their own programs"
    ON public.participant_programs FOR SELECT
    TO authenticated
    USING (auth.uid() = participant_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches can view their participants' programs"
    ON public.participant_programs FOR SELECT
    TO authenticated
    USING (auth.uid() = coach_id);
