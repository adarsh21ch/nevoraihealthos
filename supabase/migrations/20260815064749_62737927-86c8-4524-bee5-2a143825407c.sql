-- Link the coach account (Krishna) to the distributor if not already done
UPDATE public.distributors 
SET user_id = '193adc00-d5d6-4066-80a5-108f846395ba' 
WHERE name = 'Nevorai' AND (user_id IS NULL OR user_id != '193adc00-d5d6-4066-80a5-108f846395ba');

-- Ensure all current customers for that distributor are visible to the coach
-- The RLS policy "Distributors see their customers" already handles this 
-- as long as customers.distributor_id matches distributors.id.

-- Verify and fix registration_codes permissions one last time
GRANT SELECT ON public.registration_codes TO anon, authenticated;
GRANT ALL ON public.registration_codes TO service_role;

-- Ensure public.is_app_admin is accessible and secure
GRANT EXECUTE ON FUNCTION public.is_app_admin(uuid) TO authenticated, service_role;
