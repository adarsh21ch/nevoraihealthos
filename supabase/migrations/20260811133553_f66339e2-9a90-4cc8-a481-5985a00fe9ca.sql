update public.tenants set custom_domain = 'fat2fit.nevorai.com' where id = '3b800925-6d42-49eb-bfa5-4804a064a7f1';
notify pgrst, 'reload schema';