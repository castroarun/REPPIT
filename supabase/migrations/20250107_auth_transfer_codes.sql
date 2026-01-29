-- Auth Transfer Codes table for PWA session transfer
-- This allows transferring auth sessions from browser to PWA using short codes

CREATE TABLE IF NOT EXISTS auth_transfer_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes'),
  used BOOLEAN DEFAULT FALSE
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_auth_transfer_codes_code ON auth_transfer_codes(code);

-- Auto-delete expired codes (run periodically or use pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_auth_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_transfer_codes WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE auth_transfer_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (needed for browser to create code)
CREATE POLICY "Users can create their own transfer codes"
  ON auth_transfer_codes FOR INSERT
  WITH CHECK (true);

-- Anyone can read by code (needed for PWA to retrieve)
CREATE POLICY "Anyone can read transfer codes by code"
  ON auth_transfer_codes FOR SELECT
  USING (true);

-- Anyone can update (to mark as used)
CREATE POLICY "Anyone can mark codes as used"
  ON auth_transfer_codes FOR UPDATE
  USING (true);
