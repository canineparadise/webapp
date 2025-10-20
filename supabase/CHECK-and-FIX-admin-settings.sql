-- 1. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'admin_settings'
ORDER BY ordinal_position;

-- 2. Check what's currently in the table
SELECT * FROM admin_settings ORDER BY setting_key;

-- 3. Insert default settings if they don't exist
INSERT INTO admin_settings (setting_key, setting_value, setting_type, updated_at)
VALUES
  ('assessment_fee', '40', 'number', NOW()),
  ('assessment_day', 'friday', 'text', NOW()),
  ('max_dogs_per_day', '30', 'number', NOW()),
  ('business_hours_start', '07:00', 'text', NOW()),
  ('business_hours_end', '18:00', 'text', NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- 4. Verify the inserts worked
SELECT * FROM admin_settings ORDER BY setting_key;
