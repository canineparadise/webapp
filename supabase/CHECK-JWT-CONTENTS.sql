-- Check what's actually in the JWT token for the current user
SELECT
  auth.uid() as user_id,
  auth.jwt() as full_jwt,
  (auth.jwt()->>'role')::text as role_from_jwt,
  (auth.jwt()->>'user_metadata')::jsonb->>'role' as role_from_metadata,
  p.role as role_from_profiles
FROM profiles p
WHERE p.id = auth.uid();
