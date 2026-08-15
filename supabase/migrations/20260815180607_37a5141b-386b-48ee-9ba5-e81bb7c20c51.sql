-- Create bmi_leads table for sensitive health lead generation
CREATE TABLE public.bmi_leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    height_cm numeric NOT NULL,
    weight_kg numeric NOT NULL,
    activity_level text NOT NULL,
    goal text NOT NULL,
    bmi_value numeric NOT NULL,
    bmi_category text NOT NULL,
    consent_at timestamptz NOT NULL,
    report_text text,
    email_sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Grant permissions
GRANT INSERT ON public.bmi_leads TO anon;
GRANT SELECT, UPDATE, DELETE ON public.bmi_leads TO authenticated;
GRANT ALL ON public.bmi_leads TO service_role;

-- Enable RLS
ALTER TABLE public.bmi_leads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit BMI leads"
ON public.bmi_leads
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Elevated roles can read BMI leads"
ON public.bmi_leads
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Admins can manage BMI leads"
ON public.bmi_leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
