
-- Function to get program day content with tasks in one go
CREATE OR REPLACE FUNCTION public.get_program_day_with_tasks(
    _program_id uuid,
    _date date,
    _start_date date
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _day_number int;
    _result json;
BEGIN
    -- Compute day number using IST logic (inline to keep it simple and robust)
    _day_number := (_date - _start_date) + 1;

    SELECT json_build_object(
        'day_number', _day_number,
        'program_day', (
            SELECT row_to_json(pd)
            FROM public.program_days pd
            WHERE pd.program_id = _program_id AND pd.day_number = _day_number
        ),
        'tasks', (
            SELECT json_agg(t)
            FROM (
                SELECT dt.*, p.name as product_name, p.image_url as product_image
                FROM public.day_tasks dt
                LEFT JOIN public.products p ON p.id = dt.product_id
                WHERE dt.program_day_id IN (
                    SELECT id FROM public.program_days 
                    WHERE program_id = _program_id AND day_number = _day_number
                )
                ORDER BY dt.sort_order ASC
            ) t
        )
    ) INTO _result;

    RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_program_day_with_tasks(uuid, date, date) TO authenticated;
