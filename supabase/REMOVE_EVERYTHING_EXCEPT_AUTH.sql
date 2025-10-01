-- =====================================================
-- REMOVE ALL BACKEND EXCEPT AUTHENTICATION
-- This keeps users but removes everything else
-- =====================================================

-- Step 1: Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.profiles;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.dogs;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.bookings;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.subscriptions;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.assessment_requests;

-- Step 2: Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_signup CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.get_available_spots CASCADE;
DROP FUNCTION IF EXISTS public.check_booking_availability CASCADE;
DROP FUNCTION IF EXISTS public.calculate_subscription_usage CASCADE;

-- Step 3: Drop all views
DROP VIEW IF EXISTS public.available_spots CASCADE;
DROP VIEW IF EXISTS public.daily_attendance CASCADE;
DROP VIEW IF EXISTS public.monthly_revenue CASCADE;

-- Step 4: Drop all tables
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.booking_dogs CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.assessment_requests CASCADE;
DROP TABLE IF EXISTS public.dogs CASCADE;
DROP TABLE IF EXISTS public.staff_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.assessment_config CASCADE;
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;

-- Step 5: Drop all custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.dog_gender CASCADE;
DROP TYPE IF EXISTS public.dog_size CASCADE;
DROP TYPE IF EXISTS public.booking_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.assessment_status CASCADE;
DROP TYPE IF EXISTS public.day_of_week CASCADE;
DROP TYPE IF EXISTS public.dog_status CASCADE;

-- Step 6: Drop storage buckets (but keep auth)
DELETE FROM storage.objects WHERE bucket_id IN ('dog-photos', 'vaccination-certificates');
DELETE FROM storage.buckets WHERE id IN ('dog-photos', 'vaccination-certificates');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ ALL BACKEND REMOVED EXCEPT AUTH!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Removed:';
    RAISE NOTICE '• All tables (profiles, dogs, bookings, etc.)';
    RAISE NOTICE '• All functions and triggers';
    RAISE NOTICE '• All views and types';
    RAISE NOTICE '• All storage buckets';
    RAISE NOTICE '';
    RAISE NOTICE 'Kept:';
    RAISE NOTICE '• User authentication (auth.users)';
    RAISE NOTICE '• Users can still sign up and log in';
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
END $$;