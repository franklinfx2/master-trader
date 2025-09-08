-- Fix security definer view by removing security definer and using proper view
drop view if exists public.trades_stats;

create or replace view public.trades_stats as
select
  t.user_id,
  count(*) as trade_count,
  avg(nullif(t.rr,0)) as avg_rr,
  avg(case when t.result='win' then 1 when t.result='loss' then 0 end) * 100 as win_rate,
  sum(coalesce(t.pnl,0)) as total_pnl
from public.trades t
where t.result in ('win', 'loss')
group by t.user_id;

-- Fix function search path for handle_new_user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer 
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;