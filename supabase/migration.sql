-- ===================================================================
-- ArbitrAge — Supabase Tables
-- Execute this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ===================================================================

-- Courtiers / Brokers
CREATE TABLE IF NOT EXISTS brokers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'broker',
  website TEXT,
  logo TEXT,
  logo_color TEXT,
  tagline TEXT,
  deposit_minimum NUMERIC DEFAULT 0,
  accounts TEXT[] DEFAULT '{}',
  founded INTEGER,
  country TEXT DEFAULT 'FR',
  regulation TEXT[] DEFAULT '{}',
  trustpilot_score NUMERIC DEFAULT 0,
  trustpilot_count INTEGER DEFAULT 0,
  affiliate_url TEXT,
  score_overall NUMERIC DEFAULT 0,
  score_fees NUMERIC DEFAULT 0,
  score_reliability NUMERIC DEFAULT 0,
  score_ux NUMERIC DEFAULT 0,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  fees JSONB DEFAULT '{}',
  custody_fee NUMERIC DEFAULT 0,
  custody_fee_details TEXT,
  inactivity_fee NUMERIC DEFAULT 0,
  inactivity_fee_details TEXT,
  currency_fee NUMERIC DEFAULT 0,
  currency_fee_details TEXT,
  withdrawal_fee NUMERIC DEFAULT 0,
  deposit_fee NUMERIC DEFAULT 0,
  dividend_fee TEXT,
  ost_fee TEXT,
  account_opening_fee NUMERIC DEFAULT 0,
  account_closing_fee NUMERIC DEFAULT 0,
  transfer_out_fee TEXT,
  order_types TEXT[] DEFAULT '{}',
  markets_available TEXT[] DEFAULT '{}',
  etf_count INTEGER DEFAULT 0,
  welcome_offer TEXT,
  pea_max_deposit NUMERIC,
  best_for TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ETFs
CREATE TABLE IF NOT EXISTS etfs (
  isin TEXT PRIMARY KEY,
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT,
  index_name TEXT,
  index_slug TEXT,
  ter NUMERIC DEFAULT 0,
  aum_bn NUMERIC DEFAULT 0,
  replication TEXT DEFAULT 'physical',
  hedged BOOLEAN DEFAULT FALSE,
  currency TEXT DEFAULT 'EUR',
  pea_eligible BOOLEAN DEFAULT FALSE,
  domicile TEXT,
  dividend TEXT DEFAULT 'accumulating',
  inception_year INTEGER,
  description TEXT,
  available_at TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issuers (Émetteurs ETF)
CREATE TABLE IF NOT EXISTS issuers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  aum_total_bn NUMERIC DEFAULT 0,
  founded INTEGER,
  logo_domain TEXT,
  description TEXT,
  strengths TEXT[] DEFAULT '{}',
  etf_count INTEGER DEFAULT 0,
  known_for TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site content (textes modifiables depuis l'admin)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site content
INSERT INTO site_content (key, value, description) VALUES
  ('hero_title', 'Vous investissez. Mais chez qui ?', 'Titre principal de la landing page'),
  ('hero_subtitle', 'ArbitrAge calcule le coût total réel de chaque courtier, chaque ETF, chaque enveloppe. Prenez enfin la bonne décision.', 'Sous-titre hero'),
  ('hero_badge', 'Propulsé par VideoBourse · 18 ans d''expertise', 'Badge au-dessus du titre'),
  ('cta_title', 'Arrêtez de payer trop de frais.', 'Titre du CTA final'),
  ('cta_subtitle', 'Comparez en 3 minutes. Gratuit. Sans inscription.', 'Sous-titre CTA'),
  ('footer_text', '© 2026 ArbitrAge by VideoBourse. Données 2026. 100% indépendant.', 'Texte du footer')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security but allow public read
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read brokers" ON brokers FOR SELECT USING (true);
CREATE POLICY "Public read etfs" ON etfs FOR SELECT USING (true);
CREATE POLICY "Public read issuers" ON issuers FOR SELECT USING (true);
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);

-- Anon can also write (admin uses anon key + password check in app)
CREATE POLICY "Anon write brokers" ON brokers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write etfs" ON etfs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write issuers" ON issuers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write site_content" ON site_content FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brokers_updated_at BEFORE UPDATE ON brokers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER etfs_updated_at BEFORE UPDATE ON etfs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Additional content keys for metrics and testimonials
INSERT INTO site_content (key, value, description) VALUES
  ('stat_1_value', '12+', 'Métrique 1 — valeur'),
  ('stat_1_label', 'Courtiers analysés', 'Métrique 1 — label'),
  ('stat_2_value', '15', 'Métrique 2 — valeur'),
  ('stat_2_label', 'ETF référencés', 'Métrique 2 — label'),
  ('stat_3_value', '40K+', 'Métrique 3 — valeur'),
  ('stat_3_label', 'Investisseurs VB', 'Métrique 3 — label'),
  ('stat_4_value', '100%', 'Métrique 4 — valeur'),
  ('stat_4_label', 'Indépendant', 'Métrique 4 — label'),
  ('testimonial_1_name', 'Thomas R.', 'Témoignage 1 — nom'),
  ('testimonial_1_role', 'Investisseur particulier', 'Témoignage 1 — rôle'),
  ('testimonial_1_text', 'ArbitrAge m''a montré que je payais 180€ de frais de plus par an qu''ailleurs. J''ai changé en 48h.', 'Témoignage 1 — texte'),
  ('testimonial_2_name', 'Marie L.', 'Témoignage 2 — nom'),
  ('testimonial_2_role', 'Investisseuse active PEA', 'Témoignage 2 — rôle'),
  ('testimonial_2_text', 'Enfin un outil qui calcule le coût total réel sur mon profil exact. C''est ça qui manquait.', 'Témoignage 2 — texte'),
  ('testimonial_3_name', 'Karim B.', 'Témoignage 3 — nom'),
  ('testimonial_3_role', 'Investisseur passif', 'Témoignage 3 — rôle'),
  ('testimonial_3_text', 'La réponse du Conseiller IA était plus précise que tout ce que je trouvais sur les forums.', 'Témoignage 3 — texte')
ON CONFLICT (key) DO NOTHING;
