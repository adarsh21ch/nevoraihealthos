-- Ensure access_code is only on tenant_signup_credentials
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'access_code') THEN
        ALTER TABLE public.tenants DROP COLUMN access_code;
    END IF;
END $$;

-- Progress Photos bucket and table
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    storage_path TEXT NOT NULL,
    pose TEXT NOT NULL, -- 'front', 'side', 'back'
    share_consent BOOLEAN DEFAULT false,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_photos TO authenticated;
GRANT ALL ON public.progress_photos TO service_role;

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'progress_photos' AND policyname = 'Users can manage their own photos'
    ) THEN
        CREATE POLICY "Users can manage their own photos"
            ON public.progress_photos
            FOR ALL
            TO authenticated
            USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));
    END IF;
END $$;
