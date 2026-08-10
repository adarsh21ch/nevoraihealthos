-- Policies for progress-photos bucket
-- 1. Allow authenticated users to upload their own photos
-- Path format: customer_id/filename.webp
CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.current_customer_ids(auth.uid())
  )
);

-- 2. Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.current_customer_ids(auth.uid())
  )
);

-- 3. Allow distributors/admins to view photos of customers they can access
CREATE POLICY "Staff can view customer progress photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id::text = (storage.foldername(storage.objects.name))[1]
    AND public.can_access_customer(auth.uid(), c.id)
  )
);

-- 4. Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.current_customer_ids(auth.uid())
  )
);
