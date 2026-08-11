CREATE OR REPLACE FUNCTION public.get_reorder_list(_tenant_id uuid)
RETURNS TABLE (
  customer_id uuid,
  name text,
  phone text,
  program_name text,
  day_number integer,
  duration_days integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.id, c.name, c.phone, p.name,
         ((now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date - e.start_date) + 1,
         p.duration_days
  FROM public.customers c
  JOIN public.enrollments e ON e.customer_id = c.id AND e.status = 'active'
  JOIN public.programs p ON p.id = e.program_id
  WHERE c.tenant_id = _tenant_id
    AND (public.is_tenant_member(auth.uid(), _tenant_id) OR public.is_platform_admin(auth.uid()))
    AND ((now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date - e.start_date) + 1
        >= GREATEST(p.duration_days - 1, 1)
  ORDER BY c.name
  LIMIT 200;
$$;

CREATE OR REPLACE FUNCTION public.get_at_risk_list(_tenant_id uuid)
RETURNS TABLE (
  customer_id uuid,
  name text,
  phone text,
  program_name text,
  day_number integer,
  days_since_log integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT c.id, c.name, c.phone, p.name,
         ((now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date - e.start_date) + 1,
         COALESCE(
           (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date
             - (SELECT MAX(dl.log_date) FROM public.daily_logs dl WHERE dl.enrollment_id = e.id),
           (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date - e.start_date
         )::integer
  FROM public.customers c
  JOIN public.enrollments e ON e.customer_id = c.id AND e.status = 'active'
  JOIN public.programs p ON p.id = e.program_id
  WHERE c.tenant_id = _tenant_id
    AND (public.is_tenant_member(auth.uid(), _tenant_id) OR public.is_platform_admin(auth.uid()))
    AND COALESCE(
          (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date
            - (SELECT MAX(dl.log_date) FROM public.daily_logs dl WHERE dl.enrollment_id = e.id),
          (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date - e.start_date
        ) >= 3
  ORDER BY 6 DESC
  LIMIT 200;
$$;

CREATE OR REPLACE FUNCTION public.get_reorder_customers_count(_tenant_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.get_reorder_list(_tenant_id);
$$;

CREATE OR REPLACE FUNCTION public.get_at_risk_customers_count(_tenant_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer FROM public.get_at_risk_list(_tenant_id);
$$;

REVOKE EXECUTE ON FUNCTION public.get_reorder_list(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_at_risk_list(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_reorder_customers_count(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_at_risk_customers_count(uuid) FROM anon;