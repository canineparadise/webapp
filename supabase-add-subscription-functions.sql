-- Add helper function for adding subscription days

CREATE OR REPLACE FUNCTION add_subscription_days(
  p_subscription_id UUID,
  p_days_to_add INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET days_remaining = days_remaining + p_days_to_add,
      updated_at = NOW()
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to use a booking day
CREATE OR REPLACE FUNCTION use_subscription_day(
  p_subscription_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET days_remaining = GREATEST(days_remaining - 1, 0),
      updated_at = NOW()
  WHERE id = p_subscription_id
    AND is_active = TRUE
    AND days_remaining > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
