DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'booklet_url') THEN
        ALTER TABLE public.app_settings ADD COLUMN booklet_url text;
    END IF;
END $$;
