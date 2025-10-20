-- =============================================
-- SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('dog-photos', 'dog-photos', true),
  ('vaccination-docs', 'vaccination-docs', false),
  ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view own vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff to view all vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload medical records" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view own medical records" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff to view all medical records" ON storage.objects;

-- =============================================
-- DOG PHOTOS POLICIES (Public bucket)
-- =============================================

-- Allow authenticated users to upload dog photos
CREATE POLICY "Allow authenticated users to upload dog photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dog-photos'
);

-- Allow everyone to view dog photos (public bucket)
CREATE POLICY "Allow public to view dog photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dog-photos');

-- Allow users to delete their own dog photos
CREATE POLICY "Allow users to delete own dog photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dog-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- VACCINATION DOCS POLICIES (Private bucket)
-- =============================================

-- Allow authenticated users to upload vaccination docs
CREATE POLICY "Allow authenticated users to upload vaccination docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own vaccination docs
CREATE POLICY "Allow users to view own vaccination docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow staff and admin to view all vaccination docs
CREATE POLICY "Allow staff to view all vaccination docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vaccination-docs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('staff', 'admin')
  )
);

-- Allow users to delete their own vaccination docs
CREATE POLICY "Allow users to delete own vaccination docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- MEDICAL RECORDS POLICIES (Private bucket)
-- =============================================

-- Allow authenticated users to upload medical records
CREATE POLICY "Allow authenticated users to upload medical records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own medical records
CREATE POLICY "Allow users to view own medical records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow staff and admin to view all medical records
CREATE POLICY "Allow staff to view all medical records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('staff', 'admin')
  )
);

-- =============================================
-- VERIFICATION
-- =============================================

-- Check buckets created
SELECT id, name, public FROM storage.buckets WHERE id IN ('dog-photos', 'vaccination-docs', 'medical-records');

-- Check policies created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%dog photos%' OR policyname LIKE '%vaccination%' OR policyname LIKE '%medical%';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage buckets and policies configured successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Buckets created:';
  RAISE NOTICE '  - dog-photos (public)';
  RAISE NOTICE '  - vaccination-docs (private)';
  RAISE NOTICE '  - medical-records (private)';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage policies applied ✓';
END $$;
