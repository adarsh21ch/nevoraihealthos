
-- Ensure unique constraint for daily_logs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_logs_enrollment_id_log_date_key') THEN
        ALTER TABLE public.daily_logs ADD CONSTRAINT daily_logs_enrollment_id_log_date_key UNIQUE (enrollment_id, log_date);
    END IF;
END $$;

-- Add a helper for day number computation in IST
CREATE OR REPLACE FUNCTION public.get_ist_day_number(_start_date date)
RETURNS int
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    ist_now date;
BEGIN
    ist_now := (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date;
    RETURN (ist_now - _start_date) + 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ist_day_number(date) TO authenticated;
