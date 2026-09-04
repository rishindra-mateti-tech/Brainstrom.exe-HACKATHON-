# Supabase Keep-Alive

## Why this exists

Supabase pauses free-tier projects automatically after 7 days without any
API activity. Once paused, the app's database becomes unreachable until
someone manually resumes the project from the Supabase dashboard.

The workflow at `.github/workflows/supabase-keepalive.yml` runs on a
schedule (`0 6 */2 * *`, i.e. every 2 days at 06:00 UTC) and calls the
Supabase REST API. It can also be triggered manually at any time via
`workflow_dispatch`.

## Why a write, not a read

The original version of this workflow sent a plain `GET
/rest/v1/profiles?select=id&limit=1`. That request kept returning real
data, but the project still auto-paused a day or two after a "successful"
run — Supabase's inactivity clock only resets on a write/compute event, not
on a simple `SELECT`. This has been confirmed across more than one project,
not just this one.

The workflow now does a `POST` (upsert) into a dedicated `_keepalive`
table instead, so it registers as real activity. It intentionally does
**not** write into `profiles` or any other user-facing table — a fake row
there would pollute real data, and RLS blocks the anon key from writing to
those tables anyway (see `version_2/integration/supabase/schema.sql`).

## Setup required (project owner only)

This part can't be done by an agent — it requires access to the Supabase
SQL editor, the real service-role key, and GitHub repository settings.

1. Run the migration once in the Supabase SQL editor:
   `version_2/integration/supabase/keepalive_schema.sql`. It creates a
   single-row `_keepalive` table with RLS enabled and no policies, so only
   the service-role key can write to it.
2. Go to the GitHub repo's **Settings → Secrets and variables → Actions →
   New repository secret** and add:
   - `SUPABASE_URL` — same value as `NEXT_PUBLIC_SUPABASE_URL`.
   - `SUPABASE_SERVICE_ROLE_KEY` — the **service_role** key from Supabase
     project settings → API (not the anon key — the anon key can't write
     past RLS, which is the whole reason the old read-only ping stopped
     working). This key bypasses RLS, so keep it as a GitHub secret only;
     never put it in client-side code or `NEXT_PUBLIC_*` env vars.
   - The old `SUPABASE_ANON_KEY` secret is no longer used by this workflow
     and can be removed if nothing else references it.
3. Confirm the workflow file is committed to the repository's **default
   branch**. GitHub only runs `schedule`-triggered workflows from the
   default branch.
4. Trigger it once manually from the **Actions** tab (select the "Supabase
   Keep-Alive" workflow → **Run workflow**) to confirm the secret and
   migration are wired up correctly.
