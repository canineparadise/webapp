-- Create closed_days table to store business closure dates
CREATE TABLE IF NOT EXISTS closed_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closed_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_closed_days_date ON closed_days(closed_date);

-- Enable Row Level Security
ALTER TABLE closed_days ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read closed days (needed for booking checks)
CREATE POLICY "Anyone can view closed days"
  ON closed_days
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert closed days
CREATE POLICY "Admins can insert closed days"
  ON closed_days
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only admins can delete closed days
CREATE POLICY "Admins can delete closed days"
  ON closed_days
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to check if a date is a closed day
CREATE OR REPLACE FUNCTION is_closed_day(p_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM closed_days
    WHERE closed_date = p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all closed days in a date range
CREATE OR REPLACE FUNCTION get_closed_days_in_range(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  closed_date DATE,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cd.closed_date,
    cd.reason
  FROM closed_days cd
  WHERE cd.closed_date BETWEEN p_start_date AND p_end_date
  ORDER BY cd.closed_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
