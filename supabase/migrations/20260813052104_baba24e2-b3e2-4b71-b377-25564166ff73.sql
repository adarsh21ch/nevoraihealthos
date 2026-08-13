-- Create Indian meal recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    calories integer NOT NULL,
    category text NOT NULL, -- '600_cal', '300_cal_day9', 'shake_variation'
    is_veg boolean DEFAULT true,
    ingredients text[] NOT NULL,
    instructions text NOT NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view recipes" ON public.recipes FOR SELECT TO authenticated USING (true);

-- Seed Indian 600-cal meals
INSERT INTO public.recipes (name, calories, category, is_veg, ingredients, instructions)
VALUES 
('Dal Tadka & Brown Rice', 580, '600_cal', true, ARRAY['1 cup cooked yellow dal', '1/2 cup cooked brown rice', 'Cucumber salad', '1 tsp ghee'], 'Tempered dal with minimal ghee, served with portion-controlled brown rice and fresh salad.'),
('Paneer Bhurji & Roti', 610, '600_cal', true, ARRAY['100g Paneer', '1 whole wheat Roti', 'Sautéed capsicum/onion', 'Green chutney'], 'Scrambled paneer with vegetables, served with one medium roti.'),
('Grilled Chicken & Quinoa', 590, '600_cal', false, ARRAY['150g Chicken breast', '1/2 cup cooked quinoa', 'Steamed broccoli', 'Lemon-garlic dressing'], 'Lean grilled chicken with a side of fluffy quinoa and fiber-rich greens.'),
('Day 9 Transition: Oats Idli', 310, '300_cal_day9', true, ARRAY['2 Oats Idlis', 'Coconut chutney (1 tbsp)', 'Tomato sambar'], 'Light oats-based idlis for a smooth transition back to solids.');

-- Update Products with Kit Specifics using short_name
UPDATE public.products SET 
    kit_quantity = CASE 
        WHEN short_name = 'Aloe' THEN '2 x 1L Tetra Paks'
        WHEN short_name = 'Fiber' THEN '9 Packets'
        WHEN short_name = 'Therm' THEN '18 Tablets'
        WHEN short_name = 'Garcinia' THEN '54 Softgels'
        WHEN short_name = 'Shake' THEN '15 Shakes'
    END,
    daily_use = CASE
        WHEN short_name = 'Aloe' THEN '120ml per serving (see schedule)'
        WHEN short_name = 'Fiber' THEN '1 packet daily in 300ml water'
        WHEN short_name = 'Therm' THEN '2 tablets daily (morning/noon)'
        WHEN short_name = 'Garcinia' THEN '6 softgels daily (2x3)'
        WHEN short_name = 'Shake' THEN '1-2 scoops daily as meal replacement'
    END
WHERE short_name IN ('Aloe', 'Fiber', 'Therm', 'Garcinia', 'Shake');
