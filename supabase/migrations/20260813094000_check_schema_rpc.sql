-- Check which schema the function is actually in
CREATE OR REPLACE FUNCTION public.check_rpc_definition()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT routine_definition 
    FROM information_schema.routines 
    WHERE routine_name = 'get_my_auth_context' 
    AND routine_schema = 'public';
$$;
