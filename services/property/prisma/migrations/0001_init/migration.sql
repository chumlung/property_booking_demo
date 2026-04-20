CREATE SCHEMA IF NOT EXISTS svc_property;

CREATE TABLE IF NOT EXISTS svc_property.properties (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
