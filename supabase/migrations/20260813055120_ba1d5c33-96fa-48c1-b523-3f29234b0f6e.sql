-- 1. Hardening Schema for Participant Experience
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS water_glasses INTEGER DEFAULT 0;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(3,1);
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS mood TEXT; -- 'great', 'good', 'okay', 'low', 'difficult'
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS energy_level INTEGER;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS hunger_level INTEGER;

-- 2. Movement Tracking
CREATE TABLE IF NOT EXISTS public.movement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- 'walking', 'stretching', etc.
    duration_minutes INTEGER NOT NULL,
    intensity TEXT, -- 'low', 'moderate', 'high'
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE ON public.movement_logs TO authenticated;
GRANT ALL ON public.movement_logs TO service_role;
ALTER TABLE public.movement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own movement logs" ON public.movement_logs
    FOR ALL TO authenticated USING (auth.uid() = participant_id);

-- 3. Free Foods Table
CREATE TABLE IF NOT EXISTS public.free_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'unlimited', '1_serving', '2_servings'
    serving_size TEXT,
    calories_approx INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT ON public.free_foods TO authenticated;
GRANT ALL ON public.free_foods TO service_role;
ALTER TABLE public.free_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view free foods" ON public.free_foods
    FOR SELECT TO authenticated USING (true);

-- 4. Messaging
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see messages they sent or received" ON public.messages
    FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- 5. Seeding C9 Free Foods (Source: C9 Protocol)
INSERT INTO public.free_foods (name, category, serving_size) VALUES
('Arugula', 'unlimited', 'Any'),
('Celery', 'unlimited', 'Any'),
('Cucumber', 'unlimited', 'Any'),
('Eggplant', 'unlimited', 'Any'),
('Green Onions', 'unlimited', 'Any'),
('Lettuce', 'unlimited', 'Any'),
('Mushrooms', 'unlimited', 'Any'),
('Peppers', 'unlimited', 'Any'),
('Radishes', 'unlimited', 'Any'),
('Spinach', 'unlimited', 'Any'),
('String Beans', 'unlimited', 'Any'),
('Tomatoes', 'unlimited', 'Any'),
('Apples', '1_serving', '1 medium'),
('Apricots', '1_serving', '3 small'),
('Blueberries', '1_serving', '3/4 cup'),
('Cherries', '1_serving', '12'),
('Figs', '1_serving', '2 small'),
('Grapes', '1_serving', '11'),
('Grapefruit', '1_serving', '1/2 medium'),
('Kiwi', '1_serving', '1 medium'),
('Orange', '1_serving', '1 small'),
('Peach', '1_serving', '1 medium'),
('Pear', '1_serving', '1 small'),
('Plum', '1_serving', '2 medium'),
('Raspberries', '1_serving', '1 cup'),
('Strawberries', '1_serving', '8 large'),
('Artichoke', '2_servings', '1 medium'),
('Asparagus', '2_servings', '8 spears'),
('Broccoli', '2_servings', '1 cup'),
('Cauliflower', '2_servings', '1 cup'),
('Snow Peas', '2_servings', '1 cup'),
('Soybeans', '2_servings', '1/4 cup')
ON CONFLICT DO NOTHING;
