-- Dedicated table for the GitHub Actions keepalive ping.
-- Supabase's free-tier auto-pause clock only resets on a write/compute
-- event, not a plain SELECT -- so the keepalive workflow needs somewhere
-- safe to write that never touches real user data.

create table if not exists _keepalive (
  id int primary key default 1,
  pinged_at timestamptz not null default now()
);

alter table _keepalive enable row level security;
-- Intentionally no policies: RLS with zero policies blocks the anon/authenticated
-- roles entirely. Only the service_role key (used exclusively by the keepalive
-- GitHub Action, never shipped to the client) can write here.
