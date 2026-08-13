-- Seed an access code for testing signup
INSERT INTO public.access_codes (code, customer_id)
VALUES ('FAT2FIT', NULL)
ON CONFLICT (code) DO NOTHING;
