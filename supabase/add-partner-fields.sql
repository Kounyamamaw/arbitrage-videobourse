-- Add partner fields to brokers table
-- Execute in Supabase SQL Editor
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT FALSE;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS partner_rank INTEGER DEFAULT 999;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS demo_url TEXT;

-- Mark IG and ProRealTime as partners
UPDATE brokers SET is_partner = true, partner_rank = 1 WHERE slug = 'ig';
UPDATE brokers SET is_partner = true, partner_rank = 2 WHERE slug IN ('wh-selfinvest');
