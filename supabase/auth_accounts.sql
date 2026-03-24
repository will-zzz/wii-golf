-- Auth/accounts layer for PWGA.
-- Run this after supabase/schema.sql.

-- 1) Link score rounds to submitting user when provided.
alter table public.score_rounds
  add column if not exists submitted_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists submitted_at timestamptz not null default timezone('utc', now()),
  add column if not exists source text not null default 'import';

-- 2) Per-user profile.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists user_profiles_touch_updated_at on public.user_profiles;
create trigger user_profiles_touch_updated_at
before update on public.user_profiles
for each row
execute function public.touch_updated_at();

-- 3) Player claim workflow.
create table if not exists public.player_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'revoked')),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists player_claims_touch_updated_at on public.player_claims;
create trigger player_claims_touch_updated_at
before update on public.player_claims
for each row
execute function public.touch_updated_at();

create unique index if not exists uq_player_claims_one_pending_per_user_player
on public.player_claims (user_id, player_id)
where status = 'pending';

create unique index if not exists uq_player_claims_one_approved_per_user
on public.player_claims (user_id)
where status = 'approved';

create unique index if not exists uq_player_claims_one_approved_per_player
on public.player_claims (player_id)
where status = 'approved';

-- 4) Disputes for submitted scores.
create table if not exists public.score_disputes (
  id bigint generated always as identity primary key,
  round_id bigint not null references public.score_rounds(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create index if not exists idx_score_disputes_round_id on public.score_disputes(round_id);
create index if not exists idx_score_disputes_reporter_user_id on public.score_disputes(reporter_user_id);

-- 5) Admin role table.
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.app_admins enable row level security;

drop policy if exists "Admins can read own membership" on public.app_admins;
create policy "Admins can read own membership"
on public.app_admins
for select
using (auth.uid() = user_id);

-- 6) Auto-create profile rows on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (user_id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 7) RLS
alter table public.user_profiles enable row level security;
alter table public.player_claims enable row level security;
alter table public.score_disputes enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles
for select
using (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can read own claims" on public.player_claims;
create policy "Users can read own claims"
on public.player_claims
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all claims" on public.player_claims;
create policy "Admins can read all claims"
on public.player_claims
for select
using (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
);

drop policy if exists "Users can create pending claims" on public.player_claims;
create policy "Users can create pending claims"
on public.player_claims
for insert
with check (
  auth.uid() = user_id
  and status = 'pending'
);

drop policy if exists "Users can cancel own pending claims" on public.player_claims;
create policy "Users can cancel own pending claims"
on public.player_claims
for delete
using (
  auth.uid() = user_id
  and status = 'pending'
);

drop policy if exists "Admins can update claims" on public.player_claims;
create policy "Admins can update claims"
on public.player_claims
for update
using (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own disputes" on public.score_disputes;
create policy "Users can read own disputes"
on public.score_disputes
for select
using (auth.uid() = reporter_user_id);

drop policy if exists "Admins can read all disputes" on public.score_disputes;
create policy "Admins can read all disputes"
on public.score_disputes
for select
using (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
);

drop policy if exists "Users can create dispute for claimed round player" on public.score_disputes;
create policy "Users can create dispute for claimed round player"
on public.score_disputes
for insert
with check (
  reporter_user_id = auth.uid()
  and exists (
    select 1
    from public.player_claims pc
    where pc.user_id = auth.uid()
      and pc.player_id = score_disputes.player_id
      and pc.status = 'approved'
  )
  and exists (
    select 1
    from public.round_scores rs
    where rs.round_id = score_disputes.round_id
      and rs.player_id = score_disputes.player_id
  )
);

drop policy if exists "Admins can update disputes" on public.score_disputes;
create policy "Admins can update disputes"
on public.score_disputes
for update
using (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.app_admins aa
    where aa.user_id = auth.uid()
  )
);

-- 8) Tighten client table write access.
revoke all on table public.players, public.score_rounds, public.round_scores, public.events, public.player_rankings_cache
from anon, authenticated;

grant select on table public.players, public.score_rounds, public.round_scores, public.events, public.player_rankings_cache
to anon, authenticated;

grant select on table public.player_rankings
to anon, authenticated;

grant select, insert, update on table public.user_profiles to authenticated;
grant select on table public.app_admins to authenticated;
grant select, insert, update, delete on table public.player_claims to authenticated;
grant select, insert, update on table public.score_disputes to authenticated;

revoke execute on function public.refresh_player_rankings_cache() from anon, authenticated;
revoke execute on function public.trigger_refresh_player_rankings_cache() from anon, authenticated;
revoke execute on function public.points_for_position(bigint) from anon, authenticated;
