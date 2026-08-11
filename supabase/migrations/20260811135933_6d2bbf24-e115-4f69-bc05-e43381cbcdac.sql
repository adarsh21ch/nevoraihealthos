GRANT UPDATE ON public.tenants TO authenticated;
GRANT UPDATE ON public.tenants TO service_role;
UPDATE public.tenants SET slug = 'fat2fit' WHERE id = '3b800925-6d42-49eb-bfa5-4804a064a7f1';