# Supabase Keep-Alive

## Why this exists

Supabase pauses free-tier projects automatically after 7 days without any
API activity. Once paused, the app's database becomes unreachable until
someone manually resumes the project from the Supabase dashboard.

The workflow at `.github/workflows/supabase-keepalive.yml` runs on a
schedule (`0 6 */5 * *`, i.e. every 5 days at 06:00 UTC) and sends a single,
cheap `GET` request to the Supabase REST API (`/rest/v1/profiles?select=id&limit=1`).
That request counts as activity, so the project never crosses the 7-day
inactivity threshold and never auto-pauses. It can also be triggered
manually at any time via `workflow_dispatch`.

## Setup required (project owner only)

This part can't be done by an agent — it requires access to the GitHub
repository settings and the real Supabase credentials:

1. Go to the GitHub repo's **Settings → Secrets and variables → Actions →
   New repository secret** and add two secrets:
   - `SUPABASE_URL` — the same value used for `NEXT_PUBLIC_SUPABASE_URL` in
     the Next.js app's environment.
   - `SUPABASE_ANON_KEY` — the same value used for
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Confirm the workflow file is committed to the repository's **default
   branch**. GitHub only runs `schedule`-triggered workflows from the
   default branch — a workflow sitting on a feature branch will never fire
   on its own.
3. Optionally, trigger it once manually from the **Actions** tab (select
   the "Supabase Keep-Alive" workflow → **Run workflow**, which uses the
   `workflow_dispatch` trigger) to confirm the secrets are wired up
   correctly and the request succeeds.

No other configuration is needed — the workflow only reads existing
secrets and makes a single read-only request; it does not write to the
database.
