-- Policy for public-assets: anyone can read
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public assets are readable by everyone'
    ) THEN
        CREATE POLICY "Public assets are readable by everyone"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'public-assets');
    END IF;
END $$;

-- Policy for staff/admin to upload to public-assets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Staff can upload public assets'
    ) THEN
        CREATE POLICY "Staff can upload public assets"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'public-assets' AND 
            public.is_platform_admin(auth.uid())
        );
    END IF;
END $$;
