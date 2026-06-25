-- Message threading: group messages by thread_id with sender_role

ALTER TABLE messages ADD COLUMN IF NOT EXISTS thread_id uuid;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_role text;

-- Backfill existing rows: each message becomes its own thread, sent by fan
UPDATE messages
SET
  thread_id = id,
  sender_role = 'fan'
WHERE thread_id IS NULL OR sender_role IS NULL;

ALTER TABLE messages ALTER COLUMN thread_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN sender_role SET NOT NULL;

ALTER TABLE messages
  ADD CONSTRAINT messages_sender_role_check
  CHECK (sender_role IN ('fan', 'admin'));

CREATE INDEX idx_messages_thread_id ON messages (thread_id);
CREATE INDEX idx_messages_thread_created_at ON messages (thread_id, created_at DESC);
CREATE INDEX idx_messages_thread_unread_fan ON messages (thread_id, sender_role, is_read)
  WHERE sender_role = 'fan' AND is_read = false;
CREATE INDEX idx_messages_thread_unread_admin ON messages (thread_id, sender_role, is_read)
  WHERE sender_role = 'admin' AND is_read = false;
