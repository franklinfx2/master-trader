-- Create extension for UUID generation
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  paystack_customer_code text,
  paystack_subscription_code text,
  ai_last_analysis_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create trades table
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pair text not null,
  direction text not null check (direction in ('long','short')),
  entry numeric(18,8) not null,
  exit numeric(18,8),
  sl numeric(18,8),
  tp numeric(18,8),
  risk_pct numeric(6,3),
  rr numeric(8,3),
  result text default 'open' check (result in ('win','loss','be','open')),
  pnl numeric(18,2),
  notes text,
  screenshot_url text,
  executed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create trades stats view
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

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.trades enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
  
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create RLS policies for trades
create policy "Users can manage own trades" on public.trades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create storage bucket for trade screenshots
insert into storage.buckets (id, name, public) values ('screenshots', 'screenshots', false);

-- Create storage policies
create policy "Users can upload own screenshots" on storage.objects
  for insert with check (
    bucket_id = 'screenshots' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own screenshots" on storage.objects
  for select using (
    bucket_id = 'screenshots' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own screenshots" on storage.objects
  for update using (
    bucket_id = 'screenshots' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own screenshots" on storage.objects
  for delete using (
    bucket_id = 'screenshots' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );