-- Fix missing INSERT policy for nutrition_plans
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nutrition_plans' AND policyname = 'Users can insert own nutrition plans'
    ) THEN
        CREATE POLICY "Users can insert own nutrition plans" ON public.nutrition_plans
            FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nutrition_plans' AND policyname = 'Users can update own nutrition plans'
    ) THEN
        CREATE POLICY "Users can update own nutrition plans" ON public.nutrition_plans
            FOR UPDATE TO authenticated USING (auth.uid() = participant_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nutrition_plans' AND policyname = 'Users can delete own nutrition plans'
    ) THEN
        CREATE POLICY "Users can delete own nutrition plans" ON public.nutrition_plans
            FOR DELETE TO authenticated USING (auth.uid() = participant_id);
    END IF;
END $$;
