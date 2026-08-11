alter table public.tenants add column if not exists custom_domain text;
create unique index if not exists tenants_custom_domain_key
  on public.tenants (custom_domain) where custom_domain is not null;

-- Ensure grants (matching patterns in public-schema-grants instruction)
grant select, update on public.tenants to authenticated;
grant all on public.tenants to service_role;
grant select on public.tenants to anon;
