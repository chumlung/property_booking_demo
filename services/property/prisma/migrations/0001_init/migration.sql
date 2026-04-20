CREATE SCHEMA IF NOT EXISTS property;

CREATE TABLE IF NOT EXISTS property.properties (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
