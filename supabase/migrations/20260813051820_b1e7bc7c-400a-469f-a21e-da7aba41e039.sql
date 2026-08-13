-- Update existing products with correct C9 data and handle potential duplicates by name
-- First, let's update by the names we found in the DB
UPDATE public.products SET name = 'Aloe Vera Gel', kit_quantity = '2 × 1-litre', daily_use = 'See schedule' WHERE name = 'Aloe Vera Gel drink';
UPDATE public.products SET kit_quantity = '9 packets', daily_use = '1 packet/day' WHERE name = 'Fiber';
UPDATE public.products SET kit_quantity = '18 tablets', daily_use = '2 tablets/day' WHERE name = 'Therm';
UPDATE public.products SET kit_quantity = '54 softgels', daily_use = '6 softgels/day' WHERE name = 'Garcinia Plus';
UPDATE public.products SET name = 'Lite Ultra', kit_quantity = '1 serving pouch', daily_use = 'See schedule' WHERE name = 'Lite Ultra shake';

-- Ensure programs are set up (programs table has a unique constraint on 'code')
INSERT INTO public.programs (code, name, duration_days, sort_order, summary, next_program_code)
VALUES 
  ('DX4', 'DX4 Body Balancing System', 4, 10, 'The quarterly precursor to C9.', 'C9'),
  ('C9', 'C9 Nutritional Reset', 9, 20, 'Your 9-day reset, guided day by day.', 'F15'),
  ('F15', 'F15 Fitness Foundation', 15, 30, 'Builds the fitness foundation after C9.', 'V5'),
  ('V5', 'Vital5 Maintenance', 30, 40, 'Ongoing nutritional maintenance.', NULL)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  duration_days = EXCLUDED.duration_days,
  summary = EXCLUDED.summary,
  next_program_code = EXCLUDED.next_program_code;
