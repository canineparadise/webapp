-- =============================================
-- FIX STORAGE BUCKETS AND LEGAL AGREEMENTS
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKETS
-- =============================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('dog-photos', 'dog-photos', true),
  ('vaccination-docs', 'vaccination-docs', false),
  ('medical-records', 'medical-records', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- =============================================
-- 2. STORAGE POLICIES FOR DOG-PHOTOS
-- =============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to upload dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload dog photos" ON storage.objects;

-- Allow authenticated users to upload dog photos
CREATE POLICY "Allow authenticated users to upload dog photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dog-photos');

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

-- Allow users to update their own dog photos
DROP POLICY IF EXISTS "Allow users to update own dog photos" ON storage.objects;
CREATE POLICY "Allow users to update own dog photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dog-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- 3. STORAGE POLICIES FOR VACCINATION-DOCS
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to upload vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view own vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff to view all vaccination docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own vaccination docs" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload vaccination docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view own vaccination docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

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

CREATE POLICY "Allow users to delete own vaccination docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vaccination-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- 4. STORAGE POLICIES FOR MEDICAL-RECORDS
-- =============================================

DROP POLICY IF EXISTS "Allow authenticated users to upload medical records" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view own medical records" ON storage.objects;
DROP POLICY IF EXISTS "Allow staff to view all medical records" ON storage.objects;

CREATE POLICY "Allow authenticated users to upload medical records"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view own medical records"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

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
-- 5. FIX LEGAL_AGREEMENTS TABLE
-- =============================================

-- Ensure RLS is enabled
ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Users can insert own legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Users can update own legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Staff can view all legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Admin can view all legal agreements" ON legal_agreements;

-- Users can view their own legal agreements
CREATE POLICY "Users can view own legal agreements"
ON legal_agreements FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own legal agreements
CREATE POLICY "Users can insert own legal agreements"
ON legal_agreements FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own legal agreements
CREATE POLICY "Users can update own legal agreements"
ON legal_agreements FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Staff and admin can view all legal agreements
CREATE POLICY "Staff can view all legal agreements"
ON legal_agreements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('staff', 'admin')
  )
);

-- =============================================
-- 6. VERIFICATION
-- =============================================

-- Check buckets
SELECT '=== Storage Buckets ===' as info;
SELECT id, name, public FROM storage.buckets
WHERE id IN ('dog-photos', 'vaccination-docs', 'medical-records');

-- Check storage policies
SELECT '=== Storage Policies ===' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- Check legal_agreements policies
SELECT '=== Legal Agreements Policies ===' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'legal_agreements'
ORDER BY policyname;

-- Done
SELECT '✅ Storage buckets and legal_agreements RLS fixed!' as result;
