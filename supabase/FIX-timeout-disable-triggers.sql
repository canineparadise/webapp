-- ============================================
-- FIX TIMEOUT - DISABLE CUSTOM TRIGGERS ONLY
-- ============================================
-- The queries are timing out, likely due to trigger recursion
-- Disable only the custom triggers (not system FK triggers)

-- STEP 1: Disable the auto-approve triggers
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs DISABLE TRIGGER update_dogs_updated_at;

-- STEP 2: Verify triggers are disabled
SELECT
  'TRIGGER STATUS' as info,
  trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE tgenabled::text
  END as trigger_status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
ORDER BY trigger_name;

-- STEP 3: Reload PostgREST
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - Custom triggers disabled. Hard refresh browser NOW!' as instruction;
