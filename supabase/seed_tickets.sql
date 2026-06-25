-- Optional seed: sample active ticket listings for production Supabase
-- Run after migrations 007 and 008. Safe to re-run only on empty tickets table.

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
