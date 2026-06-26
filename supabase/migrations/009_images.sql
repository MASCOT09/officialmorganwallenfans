-- Image support for meet & greet events and chat messages

ALTER TABLE meet_greet ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url text;
