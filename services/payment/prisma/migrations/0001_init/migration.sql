CREATE SCHEMA IF NOT EXISTS svc_payment;

CREATE TABLE IF NOT EXISTS svc_payment.payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'succeeded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
