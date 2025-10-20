-- Add half-day subscription tiers to subscription_tiers table
-- Half days are priced at 50% of full day rates

INSERT INTO subscription_tiers (name, days_included, monthly_price, price_per_day, description, is_active)
VALUES
  ('Basic Half Day - 4 Half Days/Month', 4, 80.00, 20.00, 'Perfect for morning or afternoon sessions', true),
  ('Standard Half Day - 8 Half Days/Month', 8, 152.00, 19.00, 'Great for regular half-day care', true),
  ('Plus Half Day - 12 Half Days/Month', 12, 228.00, 19.00, 'Ideal for active pups (half days)', true),
  ('Premium Half Day - 16 Half Days/Month', 16, 288.00, 18.00, 'Best value for frequent half-day visits', true),
  ('Ultimate Half Day - 20 Half Days/Month', 20, 360.00, 18.00, 'Maximum half-day flexibility', true);

-- Verify all tiers
SELECT * FROM subscription_tiers ORDER BY days_included, monthly_price;
