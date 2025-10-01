-- Create dog_medications table for tracking current and historical medications

CREATE TABLE IF NOT EXISTS dog_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- e.g., "Twice daily", "Once daily", "Every 8 hours"
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means ongoing/no end date
  notes TEXT, -- Optional notes about the medication
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dog_medications_dog_id ON dog_medications(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_medications_dates ON dog_medications(start_date, end_date);

-- Enable RLS
ALTER TABLE dog_medications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/modify medications for their own dogs
CREATE POLICY "Users can view medications for their dogs"
  ON dog_medications FOR SELECT
  USING (
    dog_id IN (
      SELECT id FROM dogs WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medications for their dogs"
  ON dog_medications FOR INSERT
  WITH CHECK (
    dog_id IN (
      SELECT id FROM dogs WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medications for their dogs"
  ON dog_medications FOR UPDATE
  USING (
    dog_id IN (
      SELECT id FROM dogs WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medications for their dogs"
  ON dog_medications FOR DELETE
  USING (
    dog_id IN (
      SELECT id FROM dogs WHERE owner_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dog_medications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dog_medications_timestamp
  BEFORE UPDATE ON dog_medications
  FOR EACH ROW
  EXECUTE FUNCTION update_dog_medications_updated_at();

-- Verify table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dog_medications'
ORDER BY ordinal_position;
