alter table public.tenants add column if not exists custom_domain text;
create unique index if not exists tenants_custom_domain_key on public.tenants (custom_domain) where custom_domain is not null;
notify pgrst, 'reload schema';