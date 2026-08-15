DO $$
BEGIN
  RAISE NOTICE 'COLUMNS_START:%:COLUMNS_END', (
    SELECT string_agg(column_name, ', ')
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND table_schema = 'public'
  );
END $$;