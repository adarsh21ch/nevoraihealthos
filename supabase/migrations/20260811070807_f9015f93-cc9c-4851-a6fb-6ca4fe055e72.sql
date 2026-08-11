revoke all privileges on public.whatsapp_otp_codes from anon, authenticated;
revoke all privileges on public.tenant_signup_credentials from anon, authenticated;
revoke all privileges on public.whatsapp_settings from anon, authenticated;

grant all on public.whatsapp_otp_codes to service_role;
grant all on public.tenant_signup_credentials to service_role;
grant all on public.whatsapp_settings to service_role;