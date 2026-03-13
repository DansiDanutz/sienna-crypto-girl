create extension if not exists pgcrypto;

create table if not exists public.member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  tier text not null default 'free' check (tier in ('free', 'gold', 'premium')),
  subscription_status text not null default 'inactive' check (
    subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')
  ),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  api_access_enabled boolean not null default false,
  credits_balance integer not null default 100,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  key_prefix text not null,
  key_hash text not null unique,
  is_active boolean not null default true,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_keys_user_id on public.api_keys(user_id);
create index if not exists idx_api_keys_key_hash on public.api_keys(key_hash);

alter table public.member_profiles enable row level security;
alter table public.api_keys enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'member_profiles'
      and policyname = 'member_profiles_select_own'
  ) then
    create policy member_profiles_select_own
      on public.member_profiles
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'member_profiles'
      and policyname = 'member_profiles_update_own'
  ) then
    create policy member_profiles_update_own
      on public.member_profiles
      for update
      using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'api_keys'
      and policyname = 'api_keys_select_own'
  ) then
    create policy api_keys_select_own
      on public.api_keys
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'api_keys'
      and policyname = 'api_keys_insert_own'
  ) then
    create policy api_keys_insert_own
      on public.api_keys
      for insert
      with check (auth.uid() = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'api_keys'
      and policyname = 'api_keys_update_own'
  ) then
    create policy api_keys_update_own
      on public.api_keys
      for update
      using (auth.uid() = user_id);
  end if;
end
$$;

create or replace function public.set_member_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_member_profiles_updated_at on public.member_profiles;

create trigger trg_member_profiles_updated_at
before update on public.member_profiles
for each row
execute function public.set_member_profiles_updated_at();
