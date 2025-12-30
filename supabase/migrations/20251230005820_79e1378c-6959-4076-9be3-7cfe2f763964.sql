-- Add trade status and missed trade fields to trades_v2_elite
-- Create ENUM types for missed trade support
CREATE TYPE trade_status_enum AS ENUM ('Executed', 'Missed');
CREATE TYPE missed_reason_enum AS ENUM ('Hesitation', 'Away', 'Technical', 'Fear', 'Other');
CREATE TYPE hypothetical_result_enum AS ENUM ('Win', 'Loss', 'BE', 'Unknown');

-- Add new columns to trades_v2_elite
ALTER TABLE trades_v2_elite 
ADD COLUMN trade_status trade_status_enum NOT NULL DEFAULT 'Executed',
ADD COLUMN missed_reason missed_reason_enum,
ADD COLUMN hypothetical_result hypothetical_result_enum;

-- Add comment for documentation
COMMENT ON COLUMN trades_v2_elite.trade_status IS 'Whether the trade was executed or missed';
COMMENT ON COLUMN trades_v2_elite.missed_reason IS 'Reason for missing the trade (only applicable when trade_status = Missed)';
COMMENT ON COLUMN trades_v2_elite.hypothetical_result IS 'Hindsight result analysis for missed trades';