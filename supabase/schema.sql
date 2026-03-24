-- PWGA schema for Supabase/Postgres migration.
-- Run this in the Supabase SQL editor before importing CSV data.

create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  slug text not null unique,
  photo_url text,
  bio text,
  favorite_golf_shot text,
  biggest_hero text,
  greatest_foe text,
  approved boolean not null default false,
  source_timestamp timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.score_rounds (
  id bigint generated always as identity primary key,
  source_timestamp timestamptz,
  photo_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.round_scores (
  id bigint generated always as identity primary key,
  round_id bigint not null references public.score_rounds(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  player_slot smallint not null check (player_slot between 1 and 4),
  score integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (round_id, player_id),
  unique (round_id, player_slot)
);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  title text not null,
  event_date_text text,
  location text,
  description text,
  registration_open boolean not null default false,
  buy_in numeric(10,2) not null default 0,
  image_url text,
  registration_link text,
  registered_players_url text,
  winner_name text,
  winner_player_id uuid references public.players(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.player_rankings_cache (
  player_id uuid primary key references public.players(id) on delete cascade,
  games_played integer not null default 0,
  wins integer not null default 0,
  total_points integer not null default 0,
  total_score integer not null default 0,
  average_score numeric(10,3),
  rank_position integer,
  rank_label text not null default 'Unranked',
  refreshed_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists players_touch_updated_at on public.players;
create trigger players_touch_updated_at
before update on public.players
for each row
execute function public.touch_updated_at();

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
before update on public.events
for each row
execute function public.touch_updated_at();

create or replace function public.points_for_position(pos bigint)
returns integer
language sql
immutable
as $$
  select case
    when pos = 1 then 10
    when pos = 2 then 5
    when pos = 3 then 3
    else 1
  end;
$$;

create or replace function public.refresh_player_rankings_cache()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate table public.player_rankings_cache;

  with player_round_scores as (
    select
      rs.player_id,
      rs.round_id,
      rs.score,
      rank() over (partition by rs.round_id order by rs.score asc) as score_rank,
      min(rs.score) over (partition by rs.round_id) as best_score
    from public.round_scores rs
  ),
  aggregates as (
    select
      p.id as player_id,
      coalesce(count(prs.round_id), 0)::int as games_played,
      coalesce(sum(case when prs.score = prs.best_score then 1 else 0 end), 0)::int as wins,
      coalesce(sum(public.points_for_position(prs.score_rank::bigint)), 0)::int as total_points,
      coalesce(sum(prs.score), 0)::int as total_score,
      case
        when count(prs.round_id) > 0 then round((avg(prs.score))::numeric, 3)
        else null
      end as average_score
    from public.players p
    left join player_round_scores prs on prs.player_id = p.id
    where p.approved = true
    group by p.id
  ),
  ranked as (
    select
      a.*,
      case
        when a.games_played = 0 then null
        else (dense_rank() over (order by a.average_score asc, a.total_points desc, a.player_id))::int
      end as rank_position
    from aggregates a
  )
  insert into public.player_rankings_cache (
    player_id,
    games_played,
    wins,
    total_points,
    total_score,
    average_score,
    rank_position,
    rank_label,
    refreshed_at
  )
  select
    r.player_id,
    r.games_played,
    r.wins,
    r.total_points,
    r.total_score,
    r.average_score,
    r.rank_position,
    case
      when r.rank_position is null then 'Unranked'
      else 'Rank #' || r.rank_position::text
    end as rank_label,
    timezone('utc', now())
  from ranked r;
end;
$$;

create or replace function public.trigger_refresh_player_rankings_cache()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_player_rankings_cache();
  return null;
end;
$$;

drop trigger if exists round_scores_refresh_rankings on public.round_scores;
create trigger round_scores_refresh_rankings
after insert or update or delete on public.round_scores
for each statement
execute function public.trigger_refresh_player_rankings_cache();

drop trigger if exists players_refresh_rankings on public.players;
create trigger players_refresh_rankings
after insert or update or delete on public.players
for each statement
execute function public.trigger_refresh_player_rankings_cache();

create or replace view public.player_rankings as
select
  p.id,
  p.full_name,
  p.slug,
  p.photo_url,
  p.bio,
  p.favorite_golf_shot,
  p.biggest_hero,
  p.greatest_foe,
  p.approved,
  c.games_played,
  c.wins,
  c.total_points,
  c.total_score,
  c.average_score,
  c.rank_position,
  c.rank_label,
  c.refreshed_at
from public.players p
join public.player_rankings_cache c on c.player_id = p.id
where p.approved = true
order by
  c.rank_position nulls last,
  c.average_score asc nulls last,
  c.total_points desc,
  p.full_name asc;

-- Optional RLS defaults for public reads.
alter table public.players enable row level security;
alter table public.score_rounds enable row level security;
alter table public.round_scores enable row level security;
alter table public.events enable row level security;
alter table public.player_rankings_cache enable row level security;

drop policy if exists "Public read approved players" on public.players;
create policy "Public read approved players"
on public.players
for select
using (approved = true);

drop policy if exists "Public read score rounds" on public.score_rounds;
create policy "Public read score rounds"
on public.score_rounds
for select
using (true);

drop policy if exists "Public read round scores" on public.round_scores;
create policy "Public read round scores"
on public.round_scores
for select
using (true);

drop policy if exists "Public read events" on public.events;
create policy "Public read events"
on public.events
for select
using (true);

drop policy if exists "Public read rankings cache" on public.player_rankings_cache;
create policy "Public read rankings cache"
on public.player_rankings_cache
for select
using (true);

-- Ensure rankings exist even before the first score mutation trigger.
select public.refresh_player_rankings_cache();
