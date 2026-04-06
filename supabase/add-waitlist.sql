-- Table waitlist
-- Exécuter dans Supabase SQL Editor
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read waitlist" ON waitlist FOR SELECT USING (true);
CREATE POLICY "Anon insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);
