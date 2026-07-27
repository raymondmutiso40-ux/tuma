-- Run this once against your MySQL database (via Hostinger hPanel's
-- phpMyAdmin, or `mysql -u ... -p ... < schema.sql`).

CREATE TABLE IF NOT EXISTS bookings (
  ref               VARCHAR(20)   NOT NULL PRIMARY KEY,
  created_at        DATETIME      NOT NULL,
  status            VARCHAR(20)   NOT NULL,

  description       VARCHAR(255)  NOT NULL,
  category          VARCHAR(50)   NOT NULL,
  weight_kg         DECIMAL(6,2)  NOT NULL,
  photo_data_url    LONGTEXT      NULL,

  origin            VARCHAR(100)  NOT NULL,
  destination       VARCHAR(100)  NOT NULL,
  sender_name       VARCHAR(100)  NOT NULL,
  sender_phone      VARCHAR(20)   NULL,
  recipient_name    VARCHAR(100)  NOT NULL,
  recipient_phone   VARCHAR(20)   NULL,

  carrier_key       VARCHAR(50)   NOT NULL,
  carrier_name      VARCHAR(100)  NOT NULL,
  price_kes         INT           NOT NULL,

  mpesa_phone       VARCHAR(20)   NULL,
  paid_at           DATETIME      NULL,
  verified_at       DATETIME      NULL,

  INDEX idx_status (status),
  INDEX idx_carrier (carrier_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
