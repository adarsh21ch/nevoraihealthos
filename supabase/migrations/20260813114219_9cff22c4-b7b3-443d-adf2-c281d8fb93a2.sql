-- 1. Identify the 'C9' program ID
SELECT id, name FROM public.programs WHERE name LIKE '%C9%' OR name LIKE '%Clean 9%';

-- 2. Check if the 'C9' program actually exists in the database
SELECT id, name FROM public.programs;

-- 3. Fix the customer record for the specific user found in logs (Adarsh Chaturvedi)
UPDATE public.customers 
SET program_id = (SELECT id FROM public.programs WHERE name LIKE '%C9%' OR name LIKE '%Clean 9%' LIMIT 1),
    track = 'standard',
    onboarding_complete = true
WHERE user_id = '2eac1c41-12d7-406d-8952-5a99b671dfdc'
AND program_id IS NULL;

-- 4. Ensure a participant_program record exists to provide a start_date
INSERT INTO public.participant_programs (participant_id, program_id, start_date, track)
SELECT 
    '2eac1c41-12d7-406d-8952-5a99b671dfdc', 
    (SELECT id FROM public.programs WHERE name LIKE '%C9%' OR name LIKE '%Clean 9%' LIMIT 1),
    CURRENT_DATE,
    'standard'
WHERE EXISTS (SELECT 1 FROM public.programs WHERE name LIKE '%C9%' OR name LIKE '%Clean 9%')
AND NOT EXISTS (SELECT 1 FROM public.participant_programs WHERE participant_id = '2eac1c41-12d7-406d-8952-5a99b671dfdc');