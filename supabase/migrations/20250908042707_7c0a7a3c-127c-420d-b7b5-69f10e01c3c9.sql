-- Create proper RLS policy for trades_stats view access
create policy "Users can view own trade stats" on public.trades_stats
  for select using (auth.uid() = user_id);