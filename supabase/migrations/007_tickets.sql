-- Concert tickets and purchase orders

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_event_date ON tickets (event_date);

ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

CREATE TABLE ticket_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_orders_ticket_id ON ticket_orders (ticket_id);
CREATE INDEX idx_ticket_orders_user_id ON ticket_orders (user_id);
CREATE INDEX idx_ticket_orders_status ON ticket_orders (status);

ALTER TABLE ticket_orders DISABLE ROW LEVEL SECURITY;
