-- CUTiS-IQ Admin Stats RPCs
-- SECURITY DEFINER functions so genuine cross-user admin reads are possible
-- without granting the anon/authenticated key blanket table access via RLS.
-- Each function checks profiles.is_admin for the calling user (auth.uid())
-- before running the real query. Run this in the Supabase SQL editor,
-- AFTER admin_schema.sql (which adds the is_admin column/trigger).

-- Aggregate stats: total users, total scans, total unique ingredients seen.
-- product_history.ingredients stores a comma-separated normalized INCI list,
-- so unique ingredients is derived by splitting + trimming + lower-casing
-- across all rows.
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_scans BIGINT,
  total_unique_ingredients BIGINT
) AS $$
BEGIN
  IF NOT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), FALSE) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM profiles) AS total_users,
    (SELECT COUNT(*) FROM product_history) AS total_scans,
    (
      SELECT COUNT(DISTINCT ingredient)
      FROM product_history ph,
           LATERAL unnest(string_to_array(ph.ingredients, ',')) AS raw_ingredient,
           LATERAL (SELECT lower(trim(raw_ingredient)) AS ingredient) AS normalized
      WHERE normalized.ingredient <> ''
    ) AS total_unique_ingredients;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recent scans across all users, for the admin activity feed.
CREATE OR REPLACE FUNCTION get_recent_scans(limit_count INT DEFAULT 5)
RETURNS TABLE (
  id UUID,
  product_name TEXT,
  brand TEXT,
  suitability_score INTEGER,
  analysis_date TIMESTAMP WITH TIME ZONE,
  profile_name TEXT
) AS $$
BEGIN
  IF NOT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), FALSE) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT
    ph.id,
    ph.product_name,
    ph.brand,
    ph.suitability_score,
    ph.analysis_date,
    p.name AS profile_name
  FROM product_history ph
  LEFT JOIN profiles p ON p.id = ph.profile_id
  ORDER BY ph.analysis_date DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
