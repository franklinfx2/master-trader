-- ✅ Enable realtime for profiles table
-- This allows the frontend to receive instant updates when payment webhooks update the plan
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Ensure profiles table has REPLICA IDENTITY FULL for complete row data in realtime events
ALTER TABLE profiles REPLICA IDENTITY FULL;