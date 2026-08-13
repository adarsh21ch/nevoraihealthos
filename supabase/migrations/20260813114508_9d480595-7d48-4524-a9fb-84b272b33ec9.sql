UPDATE public.customers 
SET gender = 'male', onboarding_complete = true 
WHERE user_id = '2eac1c41-12d7-406d-8952-5a99b671dfdc';

SELECT id, name, gender, onboarding_complete 
FROM public.customers 
WHERE user_id = '2eac1c41-12d7-406d-8952-5a99b671dfdc';