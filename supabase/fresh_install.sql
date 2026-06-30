-- Morgan Wallen Fan Site — fresh Supabase project (run once on empty database)
-- Dashboard → SQL Editor → New query → paste all → Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- app_users
CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'fan' CHECK (role IN ('fan', 'admin')),
  country text NOT NULL DEFAULT '',
  avatar_url text,
  membership_tier text NOT NULL DEFAULT 'none'
    CHECK (membership_tier IN ('none', 'silver', 'gold', 'platinum')),
  membership_status text NOT NULL DEFAULT 'none'
    CHECK (membership_status IN ('none', 'pending', 'approved', 'rejected')),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_users_role ON app_users (role);
CREATE INDEX idx_app_users_membership_tier ON app_users (membership_tier);
CREATE INDEX idx_app_users_country ON app_users (country);
CREATE INDEX idx_app_users_last_seen_at ON app_users (last_seen_at DESC);
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- site_settings
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celebrity_name text NOT NULL DEFAULT 'Morgan Wallen',
  tagline text NOT NULL DEFAULT 'Official fan experience — giveaways, meet & greets, and more.',
  hero_video_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO site_settings (id, celebrity_name, tagline, hero_video_url, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Morgan Wallen',
  'Official fan experience — giveaways, meet & greets, and more.',
  '',
  now()
);

-- giveaways
CREATE TABLE giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  image_urls text[],
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_giveaways_status ON giveaways (status);
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;

CREATE TABLE giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (giveaway_id, user_id)
);

CREATE INDEX idx_giveaway_entries_user_id ON giveaway_entries (user_id);
CREATE INDEX idx_giveaway_entries_giveaway_id ON giveaway_entries (giveaway_id);
ALTER TABLE giveaway_entries ENABLE ROW LEVEL SECURITY;

-- meet & greet
CREATE TABLE meet_greet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL,
  max_spots integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'closed')),
  image_url text,
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meet_greet_status ON meet_greet (status);
ALTER TABLE meet_greet ENABLE ROW LEVEL SECURITY;

CREATE TABLE meet_greet_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES meet_greet (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  is_waitlist boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX idx_meet_greet_registrations_user_id ON meet_greet_registrations (user_id);
CREATE INDEX idx_meet_greet_registrations_event_id ON meet_greet_registrations (event_id);
ALTER TABLE meet_greet_registrations ENABLE ROW LEVEL SECURITY;

-- communities
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT '',
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_communities_sort_order ON communities (sort_order);
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- contact links
CREATE TABLE contact_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL CHECK (recipient IN ('artist', 'team')),
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'zangi', 'telegram')),
  url text NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_links_recipient ON contact_links (recipient);
ALTER TABLE contact_links ENABLE ROW LEVEL SECURITY;

-- messages (threading built in)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  thread_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('fan', 'admin')),
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  image_url text,
  image_urls text[],
  is_read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_user_id ON messages (user_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX idx_messages_thread_id ON messages (thread_id);
CREATE INDEX idx_messages_thread_created_at ON messages (thread_id, created_at DESC);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id) WHERE is_read = false;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- membership applications
CREATE TABLE membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  requested_tier text NOT NULL CHECK (requested_tier IN ('silver', 'gold', 'platinum')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX idx_membership_applications_user_id ON membership_applications (user_id);
CREATE INDEX idx_membership_applications_status ON membership_applications (status);
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- site buttons
CREATE TABLE site_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_buttons_sort_order ON site_buttons (sort_order);
ALTER TABLE site_buttons ENABLE ROW LEVEL SECURITY;

-- push subscriptions
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions (user_id);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- tickets
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
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'active', 'sold_out', 'rejected')),
  external_id text,
  source_name text,
  source_url text,
  fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_event_date ON tickets (event_date);
CREATE UNIQUE INDEX idx_tickets_external_source
  ON tickets (external_id, source_name)
  WHERE external_id IS NOT NULL AND source_name IS NOT NULL;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

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
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;

-- sample Morgan Wallen ticket listings
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
