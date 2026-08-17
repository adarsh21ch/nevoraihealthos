-- Update tasks that incorrectly referenced Therm
UPDATE public.day_tasks
SET 
  title = 'ARGI+ (Nitric Oxide Support)',
  detail = 'Take 1 scoop of ARGI+ mixed with 240ml of water or your Aloe Vera Gel for optimal blood flow and energy.',
  product_id = (SELECT id FROM public.products WHERE name = 'ARGI+' LIMIT 1)
WHERE title ILIKE '%Therm%' OR detail ILIKE '%Therm%';

-- Update tasks referencing Tea to Herbal Infusion
UPDATE public.day_tasks
SET 
  title = 'Herbal Infusion',
  detail = 'Sip on caffeine-free Herbal Infusion (Tulsi & Cardamom) to soothe the digestive system and support relaxation.',
  product_id = (SELECT id FROM public.products WHERE name = 'Herbal Infusion' LIMIT 1)
WHERE (title ILIKE '%Tea%' OR detail ILIKE '%Tea%') AND product_id IS NULL;
