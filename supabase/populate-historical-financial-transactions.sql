-- ============================================
-- POPULATE HISTORICAL FINANCIAL TRANSACTIONS
-- ============================================
-- This script backfills the financial_transactions table with existing payment data
-- Run this ONCE to populate historical transactions
--
-- IMPORTANT: This only includes ACTUAL PAYMENTS (subscriptions, assessments, extra days)
-- Individual day bookings are NOT separate payments - they use pre-paid subscription days

-- Step 1: Insert transactions from subscriptions (the main revenue source)
INSERT INTO financial_transactions (
  user_id,
  transaction_type,
  amount,
  currency,
  subscription_id,
  status,
  payment_date,
  description,
  created_at
)
SELECT
  s.user_id,
  'subscription' as transaction_type,
  s.monthly_price as amount,
  'GBP' as currency,
  s.id as subscription_id,
  CASE
    WHEN s.payment_status = 'paid' THEN 'completed'
    WHEN s.payment_status = 'failed' THEN 'failed'
    ELSE 'completed'
  END as status,
  s.created_at as payment_date,
  CONCAT('Subscription - ', COALESCE(st.name, 'Unknown tier'), ' - ', s.days_included, ' days') as description,
  s.created_at
FROM subscriptions s
LEFT JOIN subscription_tiers st ON s.tier_id = st.id
WHERE s.monthly_price IS NOT NULL
  AND s.monthly_price > 0
  AND NOT EXISTS (
    SELECT 1 FROM financial_transactions ft
    WHERE ft.subscription_id = s.id
    AND ft.transaction_type = 'subscription'
  );

-- Step 2: Insert transactions from extra_days_purchases (if table exists)
-- These are actual payments for additional days beyond subscription
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'extra_days_purchases') THEN
    INSERT INTO financial_transactions (
      user_id,
      transaction_type,
      amount,
      currency,
      subscription_id,
      status,
      payment_date,
      description,
      created_at
    )
    SELECT
      edp.user_id,
      'extra_days' as transaction_type,
      edp.final_amount as amount,
      'GBP' as currency,
      edp.subscription_id,
      CASE
        WHEN edp.payment_status = 'paid' THEN 'completed'
        ELSE 'pending'
      END as status,
      edp.created_at as payment_date,
      CONCAT('Extra Days Purchase - ', edp.quantity, ' days') as description,
      edp.created_at
    FROM extra_days_purchases edp
    WHERE edp.final_amount IS NOT NULL
      AND edp.final_amount > 0
      AND edp.payment_status = 'paid'
      AND NOT EXISTS (
        SELECT 1 FROM financial_transactions ft
        WHERE ft.user_id = edp.user_id
        AND ft.payment_date = edp.created_at
        AND ft.transaction_type = 'extra_days'
      );
  END IF;
END $$;

-- Step 3: Insert transactions from assessments (if there's an assessments table with payments)
-- Assessment bookings are actual payments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_bookings') THEN
    INSERT INTO financial_transactions (
      user_id,
      transaction_type,
      amount,
      currency,
      status,
      payment_date,
      description,
      created_at
    )
    SELECT
      ab.user_id,
      'assessment' as transaction_type,
      ab.amount as amount,
      'GBP' as currency,
      CASE
        WHEN ab.payment_status = 'paid' THEN 'completed'
        ELSE 'pending'
      END as status,
      ab.created_at as payment_date,
      CONCAT('Assessment Booking - ', ab.assessment_date) as description,
      ab.created_at
    FROM assessment_bookings ab
    WHERE ab.amount IS NOT NULL
      AND ab.amount > 0
      AND ab.payment_status = 'paid'
      AND NOT EXISTS (
        SELECT 1 FROM financial_transactions ft
        WHERE ft.user_id = ab.user_id
        AND ft.payment_date = ab.created_at
        AND ft.transaction_type = 'assessment'
      );
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count of transactions by type
SELECT
  transaction_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM financial_transactions
GROUP BY transaction_type
ORDER BY count DESC;

-- Recent transactions
SELECT
  ft.id,
  p.email,
  p.first_name,
  p.last_name,
  ft.transaction_type,
  ft.amount,
  ft.status,
  ft.description,
  ft.payment_date
FROM financial_transactions ft
JOIN profiles p ON p.id = ft.user_id
ORDER BY ft.payment_date DESC
LIMIT 20;

-- Total revenue
SELECT
  'Total Revenue' as metric,
  SUM(amount) as total
FROM financial_transactions
WHERE status = 'completed';
