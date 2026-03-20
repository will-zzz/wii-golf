
# Professional Wii Golfers' Association

#### Check it out at [wii.golf](https://wii.golf) ⛳️🏌️


## About

I made wii.golf in a few days using [Lovable](https://lovable.dev/) and Google Sheets. That's right—all player information, events, scores, etc. are all handled with Google Forms and stored in Google Sheets. Yay simplicity!

Went with this approach because all I have to do to approve players is type "yes" next to their name, or make a google form for event registration so I don't have to do that myself. I didn't know Google Sheets could be a decent enough database, but it can for a project like this. Just hoping it doesn't get spammed and broken.

#### Check out the player rankings here: [wii.golf/players](https://www.wii.golf/players) 🏆

## Supabase Migration

This project now includes a Postgres-first migration path so you can move off Google Sheets.

### 1) Create schema in Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor.

This creates:
- `players`
- `score_rounds`
- `round_scores`
- `events`
- `player_rankings_cache` + `player_rankings` view
- Trigger-based ranking refresh logic (`refresh_player_rankings_cache`)

### 2) Set environment variables

Use your Supabase project values:

```bash
export SUPABASE_URL="https://<project-ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

For the frontend app (browser reads), also set:

```bash
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-public-key>"
```

Put `VITE_*` values in `.env` for local dev. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

### 3) Run CSV import

The importer defaults to your current files:
- `/Users/willzzz/Downloads/PWGA - Players.csv`
- `/Users/willzzz/Downloads/PWGA - Scores.csv`
- `/Users/willzzz/Downloads/PWGA - Events.csv`

Run:

```bash
npm run db:migrate:supabase
```

For a clean re-import (delete existing DB rows first), run:

```bash
npm run db:migrate:supabase -- --reset
```

Or pass custom paths:

```bash
node ./scripts/migrate-to-supabase.mjs "<players.csv>" "<scores.csv>" "<events.csv>"
```

### Rankings without a dedicated server

You do **not** need a separate app server to compute rankings. The schema uses Postgres functions + triggers to recompute and store rankings whenever players/scores change. Your frontend can read from `player_rankings` directly.

If your data volume grows a lot, you can switch to scheduled recompute (e.g., Supabase cron + RPC) instead of per-write triggers.
