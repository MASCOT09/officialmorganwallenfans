-- Track fan last activity for "online now" indicators in admin messaging

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE INDEX idx_app_users_last_seen_at ON app_users (last_seen_at DESC);
