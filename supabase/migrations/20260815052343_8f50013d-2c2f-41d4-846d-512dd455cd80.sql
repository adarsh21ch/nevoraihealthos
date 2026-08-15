INSERT INTO public.access_codes (code) 
VALUES ('FAT2FIT') 
ON CONFLICT (code) DO NOTHING;