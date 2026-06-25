-- Site CTA buttons (admin-managed)

CREATE TABLE site_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_buttons_sort_order ON site_buttons (sort_order);

ALTER TABLE site_buttons DISABLE ROW LEVEL SECURITY;
