-- 1. Create tables first
CREATE TABLE IF NOT EXISTS public.session_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    consent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    next_session_at timestamp with time zone,
    session_link text,
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Add columns to bmi_leads
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bmi_leads' AND column_name='self_score_data') THEN
        ALTER TABLE public.bmi_leads ADD COLUMN self_score_data jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bmi_leads' AND column_name='warning_signs_count') THEN
        ALTER TABLE public.bmi_leads ADD COLUMN warning_signs_count integer DEFAULT 0;
    END IF;
END $$;

-- 3. Grants (Must be in same turn as table creation for Data API access)
GRANT INSERT ON public.bmi_leads TO anon;
GRANT INSERT ON public.session_registrations TO anon;
GRANT SELECT ON public.session_settings TO anon;
GRANT ALL ON public.session_registrations TO authenticated, service_role;
GRANT ALL ON public.session_settings TO authenticated, service_role;

-- 4. Enable RLS
ALTER TABLE public.session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Cleanup first for idempotency)
DROP POLICY IF EXISTS "Allow anon insert to session_registrations" ON public.session_registrations;
DROP POLICY IF EXISTS "Allow anon select session_settings" ON public.session_settings;
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.session_registrations;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.session_settings;

CREATE POLICY "Allow anon insert to session_registrations" ON public.session_registrations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select session_settings" ON public.session_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Admins can manage registrations" ON public.session_registrations USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage settings" ON public.session_settings USING (public.has_role(auth.uid(), 'admin'));

-- 6. Constraints for ON CONFLICT (Since primary keys are UUIDs, we need unique constraints on logical identifiers)
ALTER TABLE public.knowledge_base ADD CONSTRAINT knowledge_base_title_key UNIQUE (title);
ALTER TABLE public.products ADD CONSTRAINT products_name_key UNIQUE (name);

-- 7. Product Correction
DELETE FROM public.products WHERE name ILIKE '%Therm%';
INSERT INTO public.products (name, daily_use, sort_order) 
VALUES 
('ARGI+', 'Supports nitric oxide production.', 3),
('Herbal Infusion', 'Caffeine-free herbal tea.', 6)
ON CONFLICT (name) DO UPDATE SET 
  daily_use = EXCLUDED.daily_use,
  sort_order = EXCLUDED.sort_order;

-- 8. Seed Knowledge Base
INSERT INTO public.knowledge_base (title, content, type, category, tags, status)
VALUES 
('The Indian Protein Gap', 'Most Indian diets are heavily carb-dominant. A typical day of two aloo parathas with chai, followed by aloo-matar and roti, evening street food, and sabzi at night results in almost zero high-quality protein. To fix this, prioritize paneer, dal, chicken, eggs, tofu, and curd. Aim for 1.2g to 1.5g of protein per kg of body weight.', 'PROTEIN', 'NUTRITION', ARRAY['Indian Diet', 'Protein', 'Metabolic Health'], 'APPROVED'),
('Why Indians hit metabolic problems at a lower BMI', 'Scientific research shows that individuals of Asian-Pacific descent often experience metabolic health issues (like high blood pressure or insulin resistance) at a significantly lower BMI than Western populations. This is why we use the 23.0 cutoff for ''Overweight'' rather than the standard 25.0.', 'NUTRITION', 'RESEARCH', ARRAY['Asian-Pacific', 'BMI', 'Metabolic Health'], 'APPROVED'),
('Calories Simply', 'Energy balance is fundamental. A rough maintenance figure is your bodyweight in kg multiplied by 24. For sustainable weight loss, aim for a 200-300 calorie deficit. This is an estimate, not a strict prescription; listen to your body''s hunger and energy signals.', 'NUTRITION', 'GENERAL', ARRAY['Calories', 'Weight Loss', 'Energy'], 'APPROVED'),
('Carbs and fats are not villains', 'Carbs and fats are essential energy sources. Focus on the quality: complex carbs (whole grains) over simple sugars to avoid the spike-and-crash pattern, and prioritize healthy fats from nuts, seeds, and oils like olive or avocado over processed trans fats.', 'NUTRITION', 'GENERAL', ARRAY['Carbs', 'Fats', 'Macronutrients'], 'APPROVED'),
('The Five Pillars', 'Optimal health rests on five pillars: Nutrition (fuel quality), Sleep (restoration), Training (functional movement), Recovery (managing stress), and Consistency (daily habits). Neglecting even one pillar can stall your metabolic progress.', 'PROGRAM', 'GENERAL', ARRAY['Pillars', 'Methodology', 'Lifestyle'], 'APPROVED')
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status;
