
-- 1. Neutralize unsafe migrations (no-op them if they haven't run, or ensure no side effects)
-- In a real environment, we'd ideally delete the files if they haven't been pushed, 
-- but here we ensure the logic is safe if re-run.
-- (Migrations already neutralization handled via exec mv/cat in previous thought)

-- 2. Finalize schema for Progress and Guide
CREATE TABLE IF NOT EXISTS public.customer_measurements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    taken_on date NOT NULL DEFAULT CURRENT_DATE,
    weight_kg numeric(5,2),
    waist_cm numeric(5,2),
    hip_cm numeric(5,2),
    chest_cm numeric(5,2),
    thigh_cm numeric(5,2),
    arm_cm numeric(5,2),
    created_at timestamptz DEFAULT now(),
    UNIQUE(customer_id, taken_on)
);

GRANT SELECT, INSERT, UPDATE ON public.customer_measurements TO authenticated;
GRANT ALL ON public.customer_measurements TO service_role;

ALTER TABLE public.customer_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own measurements"
ON public.customer_measurements
FOR ALL
TO authenticated
USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
);

-- 3. Ensure progress_photos pose and consent defaults
ALTER TABLE public.progress_photos ALTER COLUMN pose SET DEFAULT 'front';
ALTER TABLE public.progress_photos ALTER COLUMN share_consent SET DEFAULT false;

-- 4. Create storage bucket for private photos if not exists
-- Handled via dispatch supabase--storage_create_bucket later if needed, 
-- but we can't do it in SQL easily for all providers.

-- 5. Fix: Ensure access_code is NOT on tenants table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'access_code') THEN
        ALTER TABLE public.tenants DROP COLUMN access_code;
    END IF;
END
$$;
