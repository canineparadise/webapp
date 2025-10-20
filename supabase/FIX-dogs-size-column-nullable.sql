-- =====================================================
-- FIX DOGS TABLE - MAKE SIZE COLUMN NULLABLE OR ADD DEFAULT
-- =====================================================
-- This fixes the "null value in column size violates not-null constraint" error
-- =====================================================

-- Option 1: Make size nullable (recommended - allows flexibility)
ALTER TABLE dogs
ALTER COLUMN size DROP NOT NULL;

-- Option 2: Set a default value for size (in case it's needed)
ALTER TABLE dogs
ALTER COLUMN size SET DEFAULT 'medium';

-- Verify the change
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'dogs' AND column_name = 'size';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Dogs table size column fixed!';
  RAISE NOTICE '✅ Size column is now nullable with default value "medium"';
  RAISE NOTICE '';
  RAISE NOTICE '📝 You can now submit dog forms without errors';
END $$;
