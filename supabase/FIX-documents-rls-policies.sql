-- Fix RLS policies for documents table to ensure users can upload documents for their own dogs

-- First, check current policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'documents';

-- Drop existing policies if they're causing issues
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Staff can view all documents" ON documents;
DROP POLICY IF EXISTS "documents_select_policy" ON documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON documents;

-- Enable RLS if not already enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view documents for their own dogs
CREATE POLICY "Users can view documents for their dogs"
ON documents FOR SELECT
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Create policy: Users can insert documents for their own dogs
CREATE POLICY "Users can insert documents for their dogs"
ON documents FOR INSERT
WITH CHECK (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Create policy: Users can delete documents for their own dogs
CREATE POLICY "Users can delete documents for their dogs"
ON documents FOR DELETE
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Create policy: Users can update documents for their own dogs
CREATE POLICY "Users can update documents for their dogs"
ON documents FOR UPDATE
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
  )
);

-- Verify the new policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'documents';
