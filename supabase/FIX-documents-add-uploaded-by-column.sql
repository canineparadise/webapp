-- Fix: Add missing 'uploaded_by' column to documents table
-- This column is required for document uploads to work properly

-- Add the uploaded_by column if it doesn't exist
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);

-- Also add uploaded_at if missing
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- Verify the columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'documents'
ORDER BY ordinal_position;
