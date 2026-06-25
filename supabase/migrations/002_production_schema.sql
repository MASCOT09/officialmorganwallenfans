-- Morgan Wallen Fan Site — production schema (core tables)
-- RLS disabled; server uses service role only.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- app_users
-- ---------------------------------------------------------------------------
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
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_users_role ON app_users (role);
CREATE INDEX idx_app_users_membership_tier ON app_users (membership_tier);
CREATE INDEX idx_app_users_country ON app_users (country);

ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- site_settings (singleton row)
-- ---------------------------------------------------------------------------
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celebrity_name text NOT NULL DEFAULT 'Morgan Wallen',
  tagline text NOT NULL DEFAULT 'Official fan experience — giveaways, meet & greets, and more.',
  hero_video_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

INSERT INTO site_settings (id, celebrity_name, tagline, hero_video_url, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Morgan Wallen',
  'Official fan experience — giveaways, meet & greets, and more.',
  '',
  now()
);

-- ---------------------------------------------------------------------------
-- giveaways
-- ---------------------------------------------------------------------------
CREATE TABLE giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_giveaways_status ON giveaways (status);

ALTER TABLE giveaways DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- giveaway_entries
-- ---------------------------------------------------------------------------
CREATE TABLE giveaway_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (giveaway_id, user_id)
);

CREATE INDEX idx_giveaway_entries_user_id ON giveaway_entries (user_id);
CREATE INDEX idx_giveaway_entries_giveaway_id ON giveaway_entries (giveaway_id);

ALTER TABLE giveaway_entries DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- meet_greet
-- ---------------------------------------------------------------------------
CREATE TABLE meet_greet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL,
  max_spots integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meet_greet_status ON meet_greet (status);

ALTER TABLE meet_greet DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- meet_greet_registrations
-- ---------------------------------------------------------------------------
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

ALTER TABLE meet_greet_registrations DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- communities
-- ---------------------------------------------------------------------------
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

ALTER TABLE communities DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- contact_links
-- ---------------------------------------------------------------------------
CREATE TABLE contact_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL CHECK (recipient IN ('artist', 'team')),
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'zangi', 'telegram')),
  url text NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_links_recipient ON contact_links (recipient);

ALTER TABLE contact_links DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- messages (thread_id and sender_role added in 004_message_threads.sql)
-- ---------------------------------------------------------------------------
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_user_id ON messages (user_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
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

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- membership_applications
-- ---------------------------------------------------------------------------
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

ALTER TABLE membership_applications DISABLE ROW LEVEL SECURITY;
