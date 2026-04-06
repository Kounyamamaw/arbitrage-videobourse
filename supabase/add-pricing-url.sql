-- Ajouter la colonne pricing_url aux brokers
-- Exécuter dans Supabase SQL Editor
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS pricing_url TEXT;

-- Mettre à jour les URLs de pages tarifaires connues
UPDATE brokers SET pricing_url = 'https://www.boursedirect.fr/fr/tarifs' WHERE slug = 'bourse-direct';
UPDATE brokers SET pricing_url = 'https://www.fortuneo.fr/bourse/offre-bourse' WHERE slug = 'fortuneo';
UPDATE brokers SET pricing_url = 'https://www.xtb.com/fr/taux-et-frais' WHERE slug = 'xtb';
UPDATE brokers SET pricing_url = 'https://traderepublic.com/fr-fr/pricing' WHERE slug = 'trade-republic';
UPDATE brokers SET pricing_url = 'https://www.interactivebrokers.com/fr/trading/commissions.php' WHERE slug = 'interactive-brokers';
UPDATE brokers SET pricing_url = 'https://www.home.saxo/fr-fr/rates-and-conditions/stocks/commissions' WHERE slug = 'saxo-banque';
UPDATE brokers SET pricing_url = 'https://www.degiro.fr/tarifs' WHERE slug = 'degiro';
UPDATE brokers SET pricing_url = 'https://www.boursobank.com/bourse/tarifs' WHERE slug = 'boursobank';
UPDATE brokers SET pricing_url = 'https://www.etoro.com/fr/trading/fees/' WHERE slug = 'etoro';
UPDATE brokers SET pricing_url = 'https://www.ig.com/fr/frais-et-commissions' WHERE slug = 'ig';
UPDATE brokers SET pricing_url = 'https://www.whselfinvest.fr/fr-fr/trading/tarifs' WHERE slug = 'wh-selfinvest';
UPDATE brokers SET pricing_url = 'https://www.linxea.com/assurance-vie/tarifs' WHERE slug = 'linxea';

-- Table pour stocker les résultats de scraping (historique)
CREATE TABLE IF NOT EXISTS scrape_logs (
  id SERIAL PRIMARY KEY,
  broker_slug TEXT REFERENCES brokers(slug),
  status TEXT NOT NULL DEFAULT 'pending',
  fields_found INTEGER DEFAULT 0,
  fees_extracted JSONB DEFAULT '{}',
  tables_found JSONB DEFAULT '[]',
  raw_text_length INTEGER DEFAULT 0,
  error_message TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scrape_logs" ON scrape_logs FOR SELECT USING (true);
CREATE POLICY "Anon write scrape_logs" ON scrape_logs FOR ALL USING (true) WITH CHECK (true);
