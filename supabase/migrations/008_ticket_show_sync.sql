-- Auto-fetched show listings: admin approval workflow

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
