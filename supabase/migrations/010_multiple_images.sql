-- Multiple images per giveaway, meet & greet event, and message

ALTER TABLE giveaways ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE meet_greet ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_urls text[];

UPDATE giveaways
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR cardinality(image_urls) = 0);

UPDATE meet_greet
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR cardinality(image_urls) = 0);

UPDATE messages
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR cardinality(image_urls) = 0);
