DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='fbo_id') THEN
        ALTER TABLE public.customers ADD COLUMN fbo_id TEXT UNIQUE;
    END IF;
END $$;

-- Fix access_codes coach_id column if it's missing (it was distributor_id in old schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='access_codes' AND column_name='coach_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='access_codes' AND column_name='distributor_id') THEN
            ALTER TABLE public.access_codes RENAME COLUMN distributor_id TO coach_id;
        ELSE
            ALTER TABLE public.access_codes ADD COLUMN coach_id UUID REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;
