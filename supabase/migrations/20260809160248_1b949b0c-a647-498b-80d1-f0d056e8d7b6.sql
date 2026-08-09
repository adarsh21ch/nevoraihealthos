-- ===== 1. TENANT CORE & SECURITY HELPERS =====

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  logo_url text,
  primary_color text NOT NULL DEFAULT '#16a34a',
  secondary_color text NOT NULL DEFAULT '#0f172a',
  owner_name text,
  whatsapp text,
  phone text,
  email text,
  features jsonb NOT NULL DEFAULT '{"sharing": true, "referrals": true, "powered_by_badge": true}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tenants TO anon, authenticated;
GRANT ALL ON public.tenants TO service_role;
GRANT UPDATE ON public.tenants TO authenticated;

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.is_platform_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.platform_admins WHERE user_id = _uid) $$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_uid uuid, _tenant uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = _uid AND tenant_id = _tenant) $$;

-- RLS for Core
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tenants are viewable by everyone" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Tenants can be updated by their owners or platform admins" ON public.tenants FOR UPDATE 
TO authenticated 
USING (public.is_tenant_member(auth.uid(), id) OR public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins are viewable by platform admins" ON public.platform_admins FOR SELECT 
TO authenticated 
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Profiles are viewable by tenant members and platform admins" ON public.profiles FOR SELECT 
TO authenticated 
USING (public.is_tenant_member(auth.uid(), tenant_id) OR public.is_platform_admin(auth.uid()));


-- ===== 2. GLOBAL PROGRAM CONTENT =====

CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  subtitle text,
  duration_days int NOT NULL,
  description text,
  hero_image_url text,
  next_program_code text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  short_desc text,
  why_in_program text,
  how_to_use text,
  common_mistakes text,
  image_url text,
  video_url text,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.program_products (
  program_id uuid NOT NULL REFERENCES public.programs ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products ON DELETE CASCADE,
  quantity text,
  sort_order int NOT NULL DEFAULT 0,
  PRIMARY KEY (program_id, product_id)
);

CREATE TABLE public.program_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs ON DELETE CASCADE,
  day_number int NOT NULL,
  title text NOT NULL,
  focus text,
  motivation text,
  meal_guidance text,
  tip text,
  UNIQUE (program_id, day_number)
);

CREATE TABLE public.day_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_day_id uuid NOT NULL REFERENCES public.program_days ON DELETE CASCADE,
  product_id uuid REFERENCES public.products ON DELETE SET NULL,
  time_slot text NOT NULL,
  suggested_time time,
  title text NOT NULL,
  dosage text,
  instructions text,
  is_optional boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

-- Grants for Global Content
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.program_products TO anon, authenticated;
GRANT SELECT ON public.program_days TO anon, authenticated;
GRANT SELECT ON public.day_tasks TO anon, authenticated;
GRANT SELECT ON public.tips TO anon, authenticated;
GRANT SELECT ON public.faqs TO anon, authenticated;

GRANT ALL ON public.programs TO service_role;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.program_products TO service_role;
GRANT ALL ON public.program_days TO service_role;
GRANT ALL ON public.day_tasks TO service_role;
GRANT ALL ON public.tips TO service_role;
GRANT ALL ON public.faqs TO service_role;

-- RLS for Global Content
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Global content is viewable by everyone" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Global products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Program products are viewable by everyone" ON public.program_products FOR SELECT USING (true);
CREATE POLICY "Program days are viewable by everyone" ON public.program_days FOR SELECT USING (true);
CREATE POLICY "Day tasks are viewable by everyone" ON public.day_tasks FOR SELECT USING (true);
CREATE POLICY "Tips are viewable by everyone" ON public.tips FOR SELECT USING (true);
CREATE POLICY "FAQs are viewable by everyone" ON public.faqs FOR SELECT USING (true);

-- Admin policies for Global Content
CREATE POLICY "Admins can manage programs" ON public.programs FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage program products" ON public.program_products FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage program days" ON public.program_days FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage day tasks" ON public.day_tasks FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage tips" ON public.tips FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid()));


-- ===== 3. TENANT-SCOPED CUSTOMER DATA =====

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  gender text,
  age int,
  height_cm numeric(5,1),
  goal_weight_kg numeric(5,1),
  health_consent_at timestamptz,
  referred_by_customer_id uuid REFERENCES public.customers ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, phone)
);
CREATE INDEX ON public.customers (tenant_id, created_at DESC);
CREATE INDEX ON public.customers (user_id);

GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

-- Customer access helpers
CREATE OR REPLACE FUNCTION public.current_customer_ids(_uid uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM public.customers WHERE user_id = _uid $$;

CREATE OR REPLACE FUNCTION public.can_access_customer(_uid uuid, _customer uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = _customer
      AND ( c.user_id = _uid
            OR public.is_tenant_member(_uid, c.tenant_id)
            OR public.is_platform_admin(_uid) )
  )
$$;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer access" ON public.customers FOR ALL 
TO authenticated 
USING (
  user_id = auth.uid() 
  OR public.is_tenant_member(auth.uid(), tenant_id) 
  OR public.is_platform_admin(auth.uid())
);

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs ON DELETE RESTRICT,
  start_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.enrollments (customer_id, status);

GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrollment access" ON public.enrollments FOR ALL 
TO authenticated 
USING (public.can_access_customer(auth.uid(), customer_id));

CREATE TABLE public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments ON DELETE CASCADE,
  log_date date NOT NULL,
  day_number int NOT NULL,
  water_ml int NOT NULL DEFAULT 0,
  mood text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, log_date)
);
CREATE INDEX ON public.daily_logs (enrollment_id, log_date DESC);

GRANT SELECT, INSERT, UPDATE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily log access" ON public.daily_logs FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e 
    WHERE e.id = enrollment_id 
    AND public.can_access_customer(auth.uid(), e.customer_id)
  )
);

CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id uuid NOT NULL REFERENCES public.daily_logs ON DELETE CASCADE,
  day_task_id uuid NOT NULL REFERENCES public.day_tasks ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (daily_log_id, day_task_id)
);

GRANT SELECT, INSERT, DELETE ON public.task_completions TO authenticated;
GRANT ALL ON public.task_completions TO service_role;

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task completion access" ON public.task_completions FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.daily_logs dl 
    JOIN public.enrollments e ON e.id = dl.enrollment_id
    WHERE dl.id = daily_log_id 
    AND public.can_access_customer(auth.uid(), e.customer_id)
  )
);

CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers ON DELETE CASCADE,
  taken_on date NOT NULL,
  weight_kg numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  chest_cm numeric(5,1),
  thigh_cm numeric(5,1),
  arm_cm numeric(5,1),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, taken_on)
);
CREATE INDEX ON public.measurements (customer_id, taken_on);

GRANT SELECT, INSERT, UPDATE ON public.measurements TO authenticated;
GRANT ALL ON public.measurements TO service_role;

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Measurement access" ON public.measurements FOR ALL 
TO authenticated 
USING (public.can_access_customer(auth.uid(), customer_id));

CREATE TABLE public.progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers ON DELETE CASCADE,
  taken_on date NOT NULL,
  storage_path text NOT NULL,
  pose text NOT NULL DEFAULT 'front',
  share_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.progress_photos (customer_id, taken_on);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_photos TO authenticated;
GRANT ALL ON public.progress_photos TO service_role;

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Progress photo access" ON public.progress_photos FOR ALL 
TO authenticated 
USING (public.can_access_customer(auth.uid(), customer_id));

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants ON DELETE CASCADE,
  referrer_customer_id uuid REFERENCES public.customers ON DELETE SET NULL,
  lead_name text,
  lead_phone text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.referrals (tenant_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral access" ON public.referrals FOR ALL 
TO authenticated 
USING (
  public.is_tenant_member(auth.uid(), tenant_id) 
  OR public.is_platform_admin(auth.uid())
  OR referrer_customer_id IN (SELECT id FROM public.current_customer_ids(auth.uid()))
);


-- ===== 4. WHATSAPP & AUTH HELPERS =====

CREATE TABLE public.whatsapp_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  user_id uuid,
  whatsapp_message_id text,
  meta_response jsonb,
  delivery_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.whatsapp_otp_codes (phone_number, created_at DESC);

GRANT ALL ON public.whatsapp_otp_codes TO service_role;
ALTER TABLE public.whatsapp_otp_codes ENABLE ROW LEVEL SECURITY;
-- No public policies, service_role only.

CREATE TABLE public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_connected boolean NOT NULL DEFAULT false,
  phone_number_id text,
  access_token text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_settings TO service_role;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
-- No public policies, service_role only.

-- Seed initial tenant
INSERT INTO public.tenants (slug, name, tagline, owner_name, whatsapp, primary_color)
VALUES ('demo', 'Health OS Demo', 'Your 9-day reset starts today', 'Adarsh', '+919999999999', '#16a34a');

-- Seed program shells
INSERT INTO public.programs (code, name, subtitle, duration_days, next_program_code, sort_order)
VALUES 
('c9', 'C9', '9-Day Reset', 9, 'fit1', 1),
('fit1', 'F15', '15-Day Fitness', 15, 'fit2', 2),
('fit2', 'F15 Advanced', '15-Day Advanced', 15, 'vital5', 3),
('vital5', 'Vital 5', 'Maintenance & Vitality', 30, NULL, 4);