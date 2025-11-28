-- ============================================
-- EXISTING CLIENTS TABLE
-- Auto-approval for existing Canine Paradise clients
-- ============================================

-- Create existing_clients table
CREATE TABLE IF NOT EXISTS existing_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast email lookup
CREATE INDEX IF NOT EXISTS idx_existing_clients_email ON existing_clients(LOWER(email));

-- Add RLS policies
ALTER TABLE existing_clients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (to check if they're existing clients)
CREATE POLICY "Allow authenticated users to read existing clients"
  ON existing_clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can modify existing clients"
  ON existing_clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comment
COMMENT ON TABLE existing_clients IS 'List of existing Canine Paradise clients who should be auto-approved without assessment';
