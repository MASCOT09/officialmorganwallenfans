-- Fix hero title left over from reference project
UPDATE site_settings
SET
  celebrity_name = 'Morgan Wallen',
  tagline = 'Official fan experience — giveaways, meet & greets, and more.',
  updated_at = now()
WHERE celebrity_name = 'Keanu Reeves';
