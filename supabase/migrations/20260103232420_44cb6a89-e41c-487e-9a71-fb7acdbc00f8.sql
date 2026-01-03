-- Create new enum for price position
CREATE TYPE price_position_enum AS ENUM ('At Level', 'Open');

-- Add new columns
ALTER TABLE trades_v2_elite 
ADD COLUMN is_htf_clear yes_no_enum DEFAULT 'No',
ADD COLUMN price_at_level_or_open price_position_enum DEFAULT 'At Level';