-- =====================================================
-- FIX ALL DATABASE QUERY ERRORS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Fix subscriptions table column name
-- The error is because the query uses 'status' but the column might be named differently
-- Check what columns exist in subscriptions table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND table_schema = 'public';

-- If the column is 'subscription_status' instead of 'status', you'll need to update the queries
-- Or add an alias/view, but first let's see what columns exist
