-- Tuma bookings schema (PostgreSQL).
--
-- This file was previously MySQL DDL, but the application talks to
-- PostgreSQL: lib/db.ts uses the `pg` driver and every query in
-- lib/store.ts uses $1-style placeholders. Running the old MySQL version
-- produced a table the app could not read, and it was missing the two
-- M-Pesa columns that lib/store.ts writes to.
--
-- Fresh database:
--   psql "$DATABASE_URL" -f schema.sql
--
-- Existing database that already has a bookings table, run the migration
-- instead — it only adds what is missing:
--   psql "$DATABASE_URL" -f migrations/001_mpesa_columns.sql

CREATE TABLE IF NOT EXISTS bookings (
  ref                        VARCHAR(20)   PRIMARY KEY,
  created_at                 TIMESTAMPTZ   NOT NULL,
  status                     VARCHAR(20)   NOT NULL,

  -- parcel
  description                VARCHAR(255)  NOT NULL,
  category                   VARCHAR(50)   NOT NULL,
  weight_kg                  NUMERIC(6,2)  NOT NULL,
  -- Data URL of the photo taken at booking. The client downscales to
  -- 1280px/JPEG first, so this is typically a couple of hundred KB.
  photo_data_url             TEXT,

  -- route
  origin                     VARCHAR(100)  NOT NULL,
  destination                VARCHAR(100)  NOT NULL,
  sender_name                VARCHAR(100)  NOT NULL,
  sender_phone               VARCHAR(20),
  recipient_name             VARCHAR(100)  NOT NULL,
  recipient_phone            VARCHAR(20),

  -- carrier
  carrier_key                VARCHAR(50)   NOT NULL,
  carrier_name               VARCHAR(100)  NOT NULL,
  price_kes                  INTEGER       NOT NULL,

  -- payment
  mpesa_phone                VARCHAR(20),
  -- Safaricom identifies its callback by CheckoutRequestID, not by our
  -- booking ref, so the STK route stores it here and the callback route
  -- looks the booking up by it.
  mpesa_checkout_request_id  VARCHAR(64),
  mpesa_receipt_number       VARCHAR(32),
  paid_at                    TIMESTAMPTZ,
  verified_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_status     ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_carrier    ON bookings (carrier_key);
-- The admin list is ORDER BY created_at DESC LIMIT 200.
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);

-- Unique rather than a plain index: one CheckoutRequestID belongs to exactly
-- one booking, and this stops a duplicate ever being written. Postgres allows
-- many NULLs in a unique index, so unpaid bookings are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_checkout_request_id
  ON bookings (mpesa_checkout_request_id);
