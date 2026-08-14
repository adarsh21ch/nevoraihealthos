DO $$
DECLARE
  _c9_id uuid;
  _dx4_id uuid;
  _f15_id uuid;
  _vital5_id uuid;
  _aloe_id uuid;
  _fiber_id uuid;
  _therm_id uuid;
  _garcinia_id uuid;
  _lite_ultra_id uuid;
  _day_id uuid;
  i int;
BEGIN
  IF EXISTS (SELECT 1 FROM public.programs WHERE code = 'C9') THEN
    RETURN;
  END IF;

  -- Programs
  INSERT INTO public.programs (code, name, duration_days, summary, next_program_code, sort_order)
  VALUES ('DX4', 'DX4', 4, '4-day precursor cleanse, ideal before C9', 'C9', 1)
  RETURNING id INTO _dx4_id;

  INSERT INTO public.programs (code, name, duration_days, summary, next_program_code, sort_order)
  VALUES ('C9', 'C9', 9, 'The 9-day reset -- entry point of the program', 'F15', 2)
  RETURNING id INTO _c9_id;

  INSERT INTO public.programs (code, name, duration_days, summary, next_program_code, sort_order)
  VALUES ('F15', 'F15', 15, '15-day fitness foundation after C9', 'VITAL5', 3)
  RETURNING id INTO _f15_id;

  INSERT INTO public.programs (code, name, duration_days, summary, next_program_code, sort_order)
  VALUES ('VITAL5', 'Vital5', 0, 'Ongoing maintenance -- pause during DX4/C9/F15', NULL, 4)
  RETURNING id INTO _vital5_id;

  -- Products (image_url / video_url left NULL -- Adarsh adds those via the admin UI)
  INSERT INTO public.products (name, short_name, kit_quantity, daily_use, how_to_use, warnings, sort_order)
  VALUES ('Aloe Vera Gel', 'Aloe', '2 x 1L Tetra Pak (~1.8L total over 9 days)', '120ml per dose per schedule', 'Shake well before pouring. Refrigerate after opening, use within 30 days.', 'Berry Nectar/Peaches flavour variants may be substituted, but if substituted the customer must drop the "1 serving/day nuts & seeds" free-food group.', 1)
  RETURNING id INTO _aloe_id;

  INSERT INTO public.products (name, short_name, kit_quantity, daily_use, how_to_use, sort_order)
  VALUES ('Fiber', 'Fiber', '9 packets', '1 packet/day', 'Mix into minimum 240-300ml water. Always take separately from other products -- fibre binds to some nutrients and reduces absorption.', 2)
  RETURNING id INTO _fiber_id;

  INSERT INTO public.products (name, short_name, kit_quantity, daily_use, how_to_use, sort_order)
  VALUES ('Therm', 'Therm', '18 tablets', '2 tablets/day (1 per dose, twice daily on most days)', 'Take with minimum 240ml water.', 3)
  RETURNING id INTO _therm_id;

  INSERT INTO public.products (name, short_name, kit_quantity, daily_use, how_to_use, sort_order)
  VALUES ('Garcinia Plus', 'Garcinia', '54 softgels', '6 softgels/day (2 per dose, three times daily)', 'Take with minimum 240ml water per dose.', 4)
  RETURNING id INTO _garcinia_id;

  INSERT INTO public.products (name, short_name, kit_quantity, daily_use, how_to_use, sort_order)
  VALUES ('Lite Ultra Shake', 'Lite Ultra', '15 servings (18 if DX4 done first -- extra pouch purchased separately)', '1 scoop per shake per schedule', 'Mix 1 scoop in 300ml water, almond milk, light soy milk, or coconut milk.', 5)
  RETURNING id INTO _lite_ultra_id;

  -- Days 1-2: identical, the "reset" days
  FOR i IN 1..2 LOOP
    INSERT INTO public.program_days (program_id, day_number, title, track)
    VALUES (_c9_id, i, 'Day ' || i, 'standard')
    RETURNING id INTO _day_id;

    INSERT INTO public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) VALUES
    (_day_id, 'morning', 'Garcinia Plus + Therm', '2 x Garcinia Plus + 1 x Therm, minimum 240ml water each', _garcinia_id, 1),
    (_day_id, 'morning', 'Wait 30 min, then Aloe', '120ml Aloe Vera Gel', _aloe_id, 2),
    (_day_id, 'mid_morning', 'Fiber', '1 packet in minimum 240-300ml water', _fiber_id, 3),
    (_day_id, 'noon', 'Garcinia Plus + Therm + Lite Ultra', '2 x Garcinia Plus + 1 x Therm + 1 scoop Lite Ultra', _garcinia_id, 4),
    (_day_id, 'noon', 'Wait 30 min, then Aloe', '120ml Aloe Vera Gel', _aloe_id, 5),
    (_day_id, 'early_evening', 'Garcinia Plus', '2 x Garcinia Plus, minimum 240ml water', _garcinia_id, 6),
    (_day_id, 'early_evening', 'Wait 30 min, then Aloe', '120ml Aloe Vera Gel', _aloe_id, 7),
    (_day_id, 'evening', 'Aloe', '120ml Aloe Vera Gel', _aloe_id, 8),
    (_day_id, 'all_day', 'Water', '8 glasses across the day', NULL, 9),
    (_day_id, 'all_day', 'Stretch', '5 minutes', NULL, 10),
    (_day_id, 'all_day', 'Light movement', '30 minutes -- slow walk, gentle stretching, or beginner yoga', NULL, 11),
    (_day_id, 'all_day', 'NEAT activity', 'Cleaning, gardening, laundry, walking -- count it', NULL, 12);
  END LOOP;

  -- Days 3-8: identical, solid meal introduced
  FOR i IN 3..8 LOOP
    INSERT INTO public.program_days (program_id, day_number, title, track)
    VALUES (_c9_id, i, 'Day ' || i, 'standard')
    RETURNING id INTO _day_id;

    INSERT INTO public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) VALUES
    (_day_id, 'morning', 'Garcinia Plus + Therm', '2 x Garcinia Plus + 1 x Therm, minimum 240ml water each', _garcinia_id, 1),
    (_day_id, 'morning', 'Wait 30 min, then Aloe + shake', '120ml Aloe Vera Gel + 1 scoop Lite Ultra in 300ml water/almond/soy/coconut milk', _aloe_id, 2),
    (_day_id, 'mid_morning', 'Fiber', '1 packet in minimum 240-300ml water', _fiber_id, 3),
    (_day_id, 'noon', 'Garcinia Plus', '2 x Garcinia Plus, minimum 240ml water', _garcinia_id, 4),
    (_day_id, 'noon', 'Wait 30 min, then shake + Therm', '1 scoop Lite Ultra + 1 x Therm', _therm_id, 5),
    (_day_id, 'early_evening', 'Garcinia Plus', '2 x Garcinia Plus, minimum 240ml water', _garcinia_id, 6),
    (_day_id, 'early_evening', 'Wait 30 min, then meal', 'Up to a 600-calorie meal -- lunch or dinner, customer''s choice. Women ~1,000 kcal/day total, men ~1,200 kcal/day (men may add 100-200 kcal via ~85g extra lean protein or one extra shake)', NULL, 7),
    (_day_id, 'evening', 'Water', 'Minimum 240ml', NULL, 8),
    (_day_id, 'all_day', 'Water', '8 glasses across the day', NULL, 9),
    (_day_id, 'all_day', 'Stretch', '5 minutes', NULL, 10),
    (_day_id, 'all_day', 'Light movement', '30 minutes', NULL, 11),
    (_day_id, 'all_day', 'NEAT activity', 'Cleaning, gardening, laundry, walking', NULL, 12);
  END LOOP;

  -- Day 9: same pattern, noon shake replaced by a 300-cal meal (the F15 transition)
  INSERT INTO public.program_days (program_id, day_number, title, focus, track)
  VALUES (_c9_id, 9, 'Day 9', 'Transition day -- last day before F15', 'standard')
  RETURNING id INTO _day_id;

  INSERT INTO public.day_tasks (program_day_id, slot, title, detail, product_id, sort_order) VALUES
  (_day_id, 'morning', 'Garcinia Plus + Therm', '2 x Garcinia Plus + 1 x Therm, minimum 240ml water each', _garcinia_id, 1),
  (_day_id, 'morning', 'Wait 30 min, then Aloe + shake', '120ml Aloe Vera Gel + 1 scoop Lite Ultra in 300ml water/almond/soy/coconut milk', _aloe_id, 2),
  (_day_id, 'mid_morning', 'Fiber', '1 packet in minimum 240-300ml water', _fiber_id, 3),
  (_day_id, 'noon', 'Garcinia Plus', '2 x Garcinia Plus, minimum 240ml water', _garcinia_id, 4),
  (_day_id, 'noon', 'Wait 30 min, then 300-calorie meal', 'Replaces the usual shake today -- the deliberate transition step into F15', NULL, 5),
  (_day_id, 'early_evening', 'Garcinia Plus', '2 x Garcinia Plus, minimum 240ml water', _garcinia_id, 6),
  (_day_id, 'early_evening', 'Wait 30 min, then meal', 'Up to a 600-calorie meal -- lunch or dinner, customer''s choice', NULL, 7),
  (_day_id, 'evening', 'Water', 'Minimum 240ml', NULL, 8),
  (_day_id, 'all_day', 'Water', '8 glasses across the day', NULL, 9),
  (_day_id, 'all_day', 'Stretch', '5 minutes', NULL, 10),
  (_day_id, 'all_day', 'Light movement', '30 minutes', NULL, 11),
  (_day_id, 'all_day', 'NEAT activity', 'Cleaning, gardening, laundry, walking', NULL, 12);

  -- Free foods
  INSERT INTO public.free_foods (name, category, serving_size) VALUES
  ('Rocket/arugula', 'unlimited', NULL),
  ('Spinach', 'unlimited', NULL),
  ('Lettuce (all varieties)', 'unlimited', NULL),
  ('Chicory', 'unlimited', NULL),
  ('Celery', 'unlimited', NULL),
  ('Cucumber', 'unlimited', NULL),
  ('Green onions', 'unlimited', NULL),
  ('Beets', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Carrots', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Brussels sprouts', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Winter squash', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Summer squash', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Kale', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Cabbage', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Asparagus', 'vegetable_2_per_day', '8 spears'),
  ('Sugarsnap peas', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('String beans', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Sea vegetables', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Cauliflower', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Broccoli', 'vegetable_2_per_day', '75g / 5 tbsp'),
  ('Blueberries', 'fruit_2_per_day', '75g'),
  ('Grapes', 'fruit_2_per_day', '75g'),
  ('Raspberries', 'fruit_2_per_day', '75g'),
  ('Blackberries', 'fruit_2_per_day', '75g'),
  ('Strawberries', 'fruit_2_per_day', '75g'),
  ('Cherries', 'fruit_2_per_day', '75g'),
  ('Grapefruit', 'fruit_2_per_day', '1 whole'),
  ('Apple', 'fruit_2_per_day', '1 whole'),
  ('Pear', 'fruit_2_per_day', '1 whole'),
  ('Peach', 'fruit_2_per_day', '1 whole'),
  ('Orange', 'fruit_2_per_day', '1 whole'),
  ('Banana', 'fruit_2_per_day', '1 whole'),
  ('Plums', 'fruit_2_per_day', '2 plums'),
  ('Walnuts', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Pecans', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Pumpkin seeds', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Almonds', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Hemp seeds', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Flax seeds', 'nuts_seeds_1_per_day', '28g / 2 tbsp'),
  ('Pomegranate seeds', 'nuts_seeds_1_per_day', '28g / 2 tbsp');
END $$;