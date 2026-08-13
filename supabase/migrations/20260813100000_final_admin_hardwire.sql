-- Force the admin into the customer table so standard logic finds them
DO $$
DECLARE
    _user_id UUID := 'b1ed3b14-6512-4f44-8adc-3ef6302f5d34';
    _tenant_id UUID;
BEGIN
    SELECT id INTO _tenant_id FROM public.tenants WHERE slug = 'fat2fit' LIMIT 1;
    
    INSERT INTO public.customers (user_id, tenant_id, name, email, onboarding_complete)
    VALUES (_user_id, _tenant_id, 'Admin', 'teamnevorai@gmail.com', true)
    ON CONFLICT (user_id) DO UPDATE 
    SET onboarding_complete = true, 
        tenant_id = _tenant_id;
END $$;
