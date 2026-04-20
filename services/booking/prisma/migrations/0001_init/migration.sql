CREATE SCHEMA IF NOT EXISTS svc_booking;

CREATE TABLE IF NOT EXISTS svc_booking.bookings (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
