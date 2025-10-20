-- Storage Policies for Assessment Videos Bucket
-- Run this script in your Supabase SQL Editor after creating the 'assessment-videos' bucket

-- ============================================
-- POLICY 1: Allow Authenticated Users to Upload Videos
-- ============================================
CREATE POLICY "Authenticated users can upload assessment videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assessment-videos');

-- ============================================
-- POLICY 2: Allow Public Read Access (Anyone can view videos)
-- ============================================
CREATE POLICY "Anyone can view assessment videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assessment-videos');

-- ============================================
-- POLICY 3: Allow Authenticated Users to Update Their Own Videos
-- ============================================
CREATE POLICY "Users can update own assessment videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assessment-videos' AND auth.uid() = owner);

-- ============================================
-- POLICY 4: Allow Authenticated Users to Delete Their Own Videos
-- ============================================
CREATE POLICY "Users can delete own assessment videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assessment-videos' AND auth.uid() = owner);

-- ============================================
-- VERIFICATION: Check that policies were created
-- ============================================
-- Run this query to verify your policies:
-- SELECT * FROM storage.policies WHERE bucket_id = 'assessment-videos';
