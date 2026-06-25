-- Run this entire file once in Supabase SQL Editor before going live.
-- Matches existing project schema (text IDs, not uuid).

-- ─── Migration 007: tickets ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tickets (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  venue text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold_out')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_date ON tickets (event_date);
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS ticket_orders (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_id text NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_ticket_id ON ticket_orders (ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_user_id ON ticket_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_status ON ticket_orders (status);
ALTER TABLE ticket_orders DISABLE ROW LEVEL SECURITY;

-- ─── Migration 008: approval workflow columns ───────────────────────────────

ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('draft', 'pending_review', 'active', 'sold_out', 'rejected'));

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS fetched_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_external_source
  ON tickets (external_id, source_name)
  WHERE external_id IS NOT NULL AND source_name IS NOT NULL;

-- ─── Seed: active ticket listings ─────────────────────────────────────────

INSERT INTO tickets (
  title, description, venue, city, event_date,
  price_cents, quantity_available, status
)
SELECT * FROM (VALUES
  (
    'Nashville Stadium Show',
    'Catch Morgan Wallen live at Nissan Stadium. Official fan community presale.',
    'Nissan Stadium',
    'Nashville, TN',
    now() + interval '60 days',
    8999,
    500,
    'active'
  ),
  (
    'VIP Pit Package — Nashville',
    'Premium pit access plus exclusive merch bundle for fan members.',
    'Bridgestone Arena',
    'Nashville, TN',
    now() + interval '90 days',
    24999,
    50,
    'active'
  ),
  (
    'Knoxville Summer Night',
    'One Night At A Time World Tour — fan community seats.',
    'Neyland Stadium',
    'Knoxville, TN',
    now() + interval '75 days',
    7999,
    350,
    'active'
  ),
  (
    'Atlanta Country Night',
    'Morgan Wallen live in Atlanta. Limited fan presale inventory.',
    'Mercedes-Benz Stadium',
    'Atlanta, GA',
    now() + interval '120 days',
    9499,
    400,
    'active'
  ),
  (
    'Austin Outdoor Show',
    'Outdoor stadium show with fan community early access pricing.',
    'Moody Center',
    'Austin, TX',
    now() + interval '150 days',
    10999,
    200,
    'active'
  )
) AS v(title, description, venue, city, event_date, price_cents, quantity_available, status)
WHERE NOT EXISTS (SELECT 1 FROM tickets LIMIT 1);
