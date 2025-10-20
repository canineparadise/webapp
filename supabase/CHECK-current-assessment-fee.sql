-- Check what the current assessment fee is
SELECT setting_key, setting_value, setting_type, updated_at
FROM admin_settings
WHERE setting_key = 'assessment_fee';
