-- Check if admin_settings table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_settings'
ORDER BY ordinal_position;

-- Check current settings
SELECT * FROM admin_settings ORDER BY setting_key;

-- Check RLS policies for admin_settings
SELECT * FROM pg_policies WHERE tablename = 'admin_settings';
