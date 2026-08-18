-- Adds the M-Pesa tracking columns to an existing bookings table.
--
-- lib/store.ts has always written mpesa_checkout_request_id and
-- mpesa_receipt_number, but the original schema never created them, so those
-- UPDATEs failed. Without mpesa_checkout_request_id there is also no way for
-- the payment callback to find the booking it belongs to.
--
-- Safe to run more than once, and additive only — no existing column or row
-- is touched.
--
--   psql "$DATABASE_URL" -f migrations/001_mpesa_columns.sql

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS mpesa_checkout_request_id VARCHAR(64),
  ADD COLUMN IF NOT EXISTS mpesa_receipt_number      VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_checkout_request_id
  ON bookings (mpesa_checkout_request_id);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON bookings (created_at DESC);
