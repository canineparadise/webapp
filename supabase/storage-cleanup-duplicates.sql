-- =============================================
-- STORAGE POLICY CLEANUP
-- Remove duplicate/old policies for cleaner setup
-- =============================================

-- These are older/duplicate policies that can be safely removed
DROP POLICY IF EXISTS "Anyone can view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload dog photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vaccination certificates" ON storage.objects;

-- Verify remaining policies (should only show the ones we want)
SELECT
  policyname,
  CASE
    WHEN policyname LIKE '%dog photos%' THEN 'dog-photos bucket'
    WHEN policyname LIKE '%vaccination%' THEN 'vaccination-docs bucket'
    WHEN policyname LIKE '%medical%' THEN 'medical-records bucket'
    ELSE 'other'
  END as bucket_group
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY bucket_group, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Duplicate policies cleaned up!';
  RAISE NOTICE '';
  RAISE NOTICE 'Active storage policies:';
  RAISE NOTICE '  DOG PHOTOS (public):';
  RAISE NOTICE '    - Allow authenticated users to upload dog photos';
  RAISE NOTICE '    - Allow public to view dog photos';
  RAISE NOTICE '    - Allow users to delete own dog photos';
  RAISE NOTICE '';
  RAISE NOTICE '  VACCINATION DOCS (private):';
  RAISE NOTICE '    - Allow authenticated users to upload vaccination docs';
  RAISE NOTICE '    - Allow users to view own vaccination docs';
  RAISE NOTICE '    - Allow staff to view all vaccination docs';
  RAISE NOTICE '    - Allow users to delete own vaccination docs';
  RAISE NOTICE '';
  RAISE NOTICE '  MEDICAL RECORDS (private):';
  RAISE NOTICE '    - Allow authenticated users to upload medical records';
  RAISE NOTICE '    - Allow users to view own medical records';
  RAISE NOTICE '    - Allow staff to view all medical records';
END $$;
