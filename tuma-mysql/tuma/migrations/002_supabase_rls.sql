-- Supabase only: lock the bookings table down to the app's own connection.
--
-- Why this is needed. Supabase exposes every table in the `public` schema
-- through PostgREST, and its default privileges grant the `anon` role access
-- to new tables. The anon key is public by design — it ships to browsers — so
-- a table created with a plain CREATE TABLE and no row-level security is
-- readable, and writable, by anyone who has that key. Parcel bookings carry
-- names, phone numbers and photos, so that is not acceptable.
--
-- Tuma never uses the anon key or PostgREST. It connects straight to Postgres
-- with the `postgres` role from DATABASE_URL, and that role has BYPASSRLS —
-- so enabling RLS with no policies at all closes the public API while leaving
-- the application untouched.
--
--   psql "$DATABASE_URL" -f migrations/002_supabase_rls.sql
--   (or paste it into the Supabase SQL Editor)
--
-- After running it, load /admin and confirm bookings still list. If something
-- is wrong you will see an empty table rather than data loss, and it reverses
-- cleanly:
--   ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Deliberately no CREATE POLICY. With RLS on and no policy, anon and
-- authenticated get nothing; the app's own connection is unaffected.

-- Belt and braces: withdraw the default grants too, so the table is closed
-- even if a policy is added carelessly later. Guarded by a role check so this
-- file still runs on a plain Postgres, where anon/authenticated don't exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE bookings FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE bookings FROM authenticated;
  END IF;
END
$$;
