DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN email text;
    RAISE NOTICE 'Added email column to customers table';
  ELSE
    RAISE NOTICE 'Email column already exists';
  END IF;
END $$;