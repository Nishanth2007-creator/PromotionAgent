-- Quantix Promotion Agent - Supabase schema
-- Run this in Supabase SQL Editor

create table if not exists contacts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists campaigns (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists delivery_logs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table contacts enable row level security;
alter table campaigns enable row level security;
alter table delivery_logs enable row level security;

-- Demo/anon-friendly policies (tighten these for production with auth-based ownership)
create policy "anon read contacts" on contacts for select using (true);
create policy "anon write contacts" on contacts for insert with check (true);
create policy "anon update contacts" on contacts for update using (true);
create policy "anon delete contacts" on contacts for delete using (true);

create policy "anon read campaigns" on campaigns for select using (true);
create policy "anon write campaigns" on campaigns for insert with check (true);
create policy "anon update campaigns" on campaigns for update using (true);
create policy "anon delete campaigns" on campaigns for delete using (true);

create policy "anon read delivery_logs" on delivery_logs for select using (true);
create policy "anon write delivery_logs" on delivery_logs for insert with check (true);
create policy "anon update delivery_logs" on delivery_logs for update using (true);
create policy "anon delete delivery_logs" on delivery_logs for delete using (true);
