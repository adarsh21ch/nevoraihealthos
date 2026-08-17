-- 1. Correct Tables for Session Funnel
CREATE TABLE IF NOT EXISTS public.session_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    consent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT INSERT ON public.session_registrations TO anon;
GRANT SELECT ON public.session_registrations TO authenticated;
GRANT ALL ON public.session_registrations TO service_role;

ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert registrations" ON public.session_registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.session_registrations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.session_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    next_session_at TIMESTAMPTZ,
    session_link TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.session_settings TO anon;
GRANT ALL ON public.session_settings TO authenticated;
GRANT ALL ON public.session_settings TO service_role;

ALTER TABLE public.session_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view session settings" ON public.session_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Admins can manage session settings" ON public.session_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Initial setting without ON CONFLICT (idempotent for one-time seed)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.session_settings LIMIT 1) THEN
        INSERT INTO public.session_settings (next_session_at, session_link)
        VALUES (now() + interval '3 days', 'https://zoom.us/j/example');
    END IF;
END $$;

-- 2. BMI Leads expansion
ALTER TABLE public.bmi_leads ADD COLUMN IF NOT EXISTS self_score_data JSONB;
ALTER TABLE public.bmi_leads ADD COLUMN IF NOT EXISTS warning_signs_count INT;

-- 3. Correct Products
DELETE FROM public.products WHERE name ILIKE '%Therm%';

-- Use name as anchor if unique, or just insert if not present
INSERT INTO public.products (name, short_name, sort_order, kit_quantity, how_to_use, daily_use)
SELECT 'ARGI+', 'ARGI', 3, '30 Stick Packs', 'Mix one packet of ARGI+ with 240-300 ml of water or other beverage once daily.', '1 stick pack daily'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'ARGI+');

INSERT INTO public.products (name, short_name, sort_order, kit_quantity, how_to_use, daily_use)
SELECT 'Herbal Infusion', 'Tea', 6, '25 Bags', 'Use one tea bag per cup. Add boiling water and brew for 3-5 minutes before removing the tea bag.', '1-2 cups daily'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE name = 'Herbal Infusion');

-- 4. Correct Tasks (fixing the column name from 'description' to 'instructions' if that's what it is, or just title)
UPDATE public.day_tasks 
SET title = REPLACE(title, 'Therm', 'ARGI+')
WHERE title ILIKE '%Therm%';

-- We check day_tasks columns in parallel read below to fix instructions if needed.
