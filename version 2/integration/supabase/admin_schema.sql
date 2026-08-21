-- CUTiS-IQ Admin Schema
-- Adds a proper is_admin flag to profiles, gated so that only the
-- service role (never a user's own client) can flip it. Run this in the
-- Supabase SQL editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION prevent_self_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin AND auth.role() <> 'service_role' THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_self_admin_promotion ON profiles;
CREATE TRIGGER trg_prevent_self_admin_promotion
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_self_admin_promotion();

-- After running this migration, promote your own account to admin once,
-- via the Supabase SQL editor (service role context), e.g.:
--   UPDATE profiles SET is_admin = true WHERE id = '<your-user-id>';
