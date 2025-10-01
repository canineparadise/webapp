-- Rename weight_kg to weight_lbs for clarity

ALTER TABLE dogs RENAME COLUMN weight_kg TO weight_lbs;

-- Or if you prefer to keep the column name generic:
-- ALTER TABLE dogs RENAME COLUMN weight_kg TO weight;
