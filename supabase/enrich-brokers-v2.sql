-- ================================================================
-- ENRICHISSEMENT V2 — 24 courtiers supplémentaires
-- Courtiers non couverts par enrich-brokers-claude.sql (v1)
-- Exécuter APRÈS enrich-brokers-claude.sql dans Supabase > SQL Editor
-- ================================================================

-- ── BFORBANK (néobanque Crédit Agricole) ──────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.6)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 1800),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Groupe Crédit Agricole — très solide','Carte bancaire premium incluse','Frais de courtage corrects pour une banque'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage plus élevés que néo-brokers','Pas de crypto','Interface vieillissante'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque du Groupe Crédit Agricole'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'bforbank';

-- ── BITVAVO (exchange crypto néerlandais) ────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.6)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 8.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.1)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 15000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 1)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais parmi les plus bas d''Europe (0,25% max)','Réglementé DNB aux Pays-Bas','Interface claire et simple','Dépôts SEPA gratuits'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Moins de cryptos que Binance','Pas de PEA/CTO','Staking limité'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Plateforme européenne pour la crypto'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'bitvavo';

-- ── BNP PARIBAS ──────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.0)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 4.0)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 6.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 1.5)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 8000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Solidité maximale — 1ère banque européenne','IFU fourni, compte 100% français','Conseiller dédié en agence'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage très élevés (min 20€/ordre)','Frais de change 0,5% min 18€','Pas adapté à l''investissement régulier'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Grande banque française, leader européen'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'bnp-paribas';

-- ── CAISSE D'EPARGNE ─────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 5.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 3.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 5.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 1.4)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 5000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Réseau bancaire historique très dense','IFU fourni, compte français','Livret A et PEL disponibles'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage parmi les plus élevés de France','Interface digitale obsolète','Conseiller souvent peu expert en bourse'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Caisses d''Epargne, Groupe BPCE'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'caisse-d-epargne';

-- ── CAPITAL.COM ──────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.3)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 9000),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','forex','cfd','crypto','indices'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['tradingview'] ELSE platforms END
WHERE slug = 'capital-com';

-- ── CREDIT AGRICOLE ──────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 5.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 3.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 6.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 1.6)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 12000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['1ère banque agricole mondiale','IFU fourni automatiquement','Réseau dense, conseiller disponible'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais parmi les plus élevés du marché','Pas adapté au trading régulier','Interface web datée'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La banque de l''agriculture et des particuliers français'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'cr-dit-agricole';

-- ── CREDIT MUTUEL ────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 5.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 3.8)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 6.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 2.0)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 6000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Banque mutualiste solide','IFU fourni, compte français','Bancassurance complète'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage élevés','Pas de néobanque intégrée','Interface en retard vs concurrents'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Banque et assureur de premier plan en France'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'cr-dit-mutuel';

-- ── EASYBOURSE (La Banque Postale) ───────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 5.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 6.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.2)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 800),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Courtier de La Banque Postale — sécurité maximale','IFU fourni, compte français','Accès aux marchés français et européens'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais élevés vs néo-brokers','Plateforme peu moderne','Pas de crypto'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Easybourse, le courtier en ligne de La Banque Postale'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'easybourse';

-- ── GREEN-GOT ────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.0)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.9)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 1200),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Financement 100% de la transition écologique','Carte bancaire Visa','Application moderne et intuitive'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de compte-titres ni PEA','Offre bancaire limitée vs banques classiques','Moins de fonctionnalités que Revolut ou N26'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque de la transition écologique'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'green-got';

-- ── HELIOS ───────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 5.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.7)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 600),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Épargne investie dans des projets écologiques','Bilan carbone de vos dépenses inclus','Compte courant standard avec IBAN français'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA ni CTO','Offre bancaire basique','Frais mensuels 7-12€/mois'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Néobanque de la transition écologique'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'helios';

-- ── HELLO BANK! (BNP Paribas) ────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.0)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.0)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 4000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Groupe BNP — solidité bancaire maximale','Carte bancaire gratuite sous conditions','IFU fourni, compte 100% français'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage plus élevés que néo-brokers','Frais de change 1% min 9€','Pas de crypto'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque du Groupe BNP Paribas'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'hello-bank';

-- ── KRAKEN (scores manquants dans export) ────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.9)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 8.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'kraken';

-- ── LA BANQUE POSTALE ────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 5.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 3.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 5.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 1.5)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Réseau postal — présence partout en France','Service public de confiance','IFU fourni, compte français'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais très élevés sur courtage','EasyBourse est leur branche courtage dédiée','Transformation digitale en cours mais lente'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Héritière des services financiers de La Poste'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'la-banque-postale';

-- ── LYDIA / SUMERIA ──────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.8)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 5000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Application de paiement entre amis très populaire','Rebranding en Sumeria avec fonctions bancaires','Carte Visa disponible'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA ni CTO','Investissement non disponible','Concurrencé par Revolut et N26'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Payer, rembourser et collecter simplement'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'lydia';

-- ── MONABANQ ─────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 6.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 5.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.5)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 2500),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Adossée au Crédit Mutuel — très solide','IBAN français, carte Visa incluse','Bonne application mobile'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de CTO ni PEA directement','Frais mensuels 2€/mois','Offre d''investissement limitée'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque du Crédit Mutuel'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'monabanq';

-- ── N26 ──────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.2)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.0)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 65000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Licence bancaire européenne — vraie banque','Compte 100% gratuit en formule standard','Interface mobile épurée et moderne'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA ni CTO','IBAN allemand — pas idéal pour France','Support parfois lent'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Néobanque allemande avec licence bancaire européenne'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'n26';

-- ── OKX ──────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.5)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 8.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 7.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.7)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 4000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 10)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais maker parmi les plus bas (0,08%)','Trading spot + futures + options','Portefeuille Web3 intégré'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Siège aux Seychelles — régulation limitée','Interface complexe pour débutants','Pas enregistré PSAN en France'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Exchange crypto rapide, performant et puissant'),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'okx';

-- ── PEPPERSTONE (scores manquants) ───────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.9)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 8.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['forex','cfd','indices','actions'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['metatrader','tradingview'] ELSE platforms END
WHERE slug = 'pepperstone';

-- ── QONTO ────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.0)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 9.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.3)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 12000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte pro'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Leader néobanque pro en Europe','Comptabilité et facturation intégrées','IBAN français, multi-utilisateurs'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Uniquement comptes professionnels','Pas d''investissement (PEA/CTO)','Frais mensuels 9-249€/mois selon plan'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque des comptes pro'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'qonto';

-- ── REVOLUT ──────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 9.2)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.4)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 160000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 1)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte courant','CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['App tout-en-un : banque, bourse, crypto','Carte multi-devises sans frais de change','Plans d''investissement automatiques (DCA)','Plus de 45 millions d''utilisateurs en Europe'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA','IBAN lituanien — moins pratique en France','Support client peu réactif'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La néobanque tout-en-un pour votre argent'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto'] ELSE asset_classes END
WHERE slug = 'revolut';

-- ── SOCIÉTÉ GÉNÉRALE ─────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 5.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 3.8)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 6.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 1.6)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 15000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Leader européen des services financiers','IFU fourni, compte français','Boursobank est leur branche néobanque'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage très élevés en agence','Mieux vaut utiliser BoursoBank à la place','Interface web traditionnelle et lente'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Un leader européen des services financiers depuis 1864'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'soci-t-g-n-rale';

-- ── SWISSBORG ────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.2)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.4)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 5000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 10)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Best rate algorithm — optimise les frais','Interface très simple et épurée','Yield sur crypto disponible','Token CHSB avec cashback'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Moins de cryptos que Binance ou Kraken','Siège en Suisse — hors UE','Token propriétaire (risque centralisé)'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'App crypto : acheter et vendre avec frais réduits'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'swissborg';

-- ── SWISSQUOTE ───────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.0)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3500),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Banque suisse réglementée FINMA — fiabilité maximale','Accès actions, ETF, forex, crypto','Bonne plateforme avancée'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais élevés vs concurrents','Pas de PEA (compte étranger Suisse)','Dépôt minimum élevé selon plan'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Broker suisse : plateformes performantes et fiables'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','forex','crypto'] ELSE asset_classes END
WHERE slug = 'swissquote';

-- ── WISE ─────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 8.0)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 9.0)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.3)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 230000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 0)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['Compte multi-devises'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Taux de change au cours interbancaire réel','40+ devises dans un seul compte','Carte Wise utilisable dans 160+ pays','Coté en bourse à Londres — très solide'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas d''investissement (PEA/CTO)','Frais sur retraits au-delà de 200€/mois','IBAN belge — pas idéal pour domiciliation FR'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Multi-devises : 160 pays, 40 devises, un seul compte'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY[]::text[] ELSE asset_classes END
WHERE slug = 'wise';

-- ── YOMONI ───────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 8.0)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 7.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.5)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.7)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 1000)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['AV','PER','PEA'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Gestion pilotée simple et accessible','Portefeuilles 100% ETF — frais faibles','Excellent service client noté 4,7/5 Trustpilot','PEA disponible depuis 2021'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de gestion libre — uniquement pilotée','Frais de gestion 1,6% tout compris','Dépôt minimum 1 000€'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La gestion pilotée en ETF accessible à tous'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['etf','obligations','actions'] ELSE asset_classes END
WHERE slug = 'yomoni';

-- ── BINANCE (ajouter les scores manquants) ───────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.8)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 9.2)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.0)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 7.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.9)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 20000),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'binance';

-- ── BITPANDA (ajouter les scores manquants) ──────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.2)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 6.5)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 8.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 3.8)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 8000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum::numeric, 0), 25)::text,
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Crypto + actions + métaux dans une seule app','Plans d''épargne automatiques','Réglementé en Europe (Autriche)'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Spread intégré sur les cryptos','Pas de PEA','Compte autrichien'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Investissez dans 650+ cryptos, actions et métaux'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto'] ELSE asset_classes END
WHERE slug = 'bitpanda';

-- Vérification finale — compter les brokers avec score > 0
SELECT COUNT(*) as total,
       COUNT(CASE WHEN score_overall::numeric > 0 THEN 1 END) as avec_score,
       COUNT(CASE WHEN score_overall::numeric = 0 THEN 1 END) as sans_score
FROM brokers;

-- ── CMC MARKETS ──────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall::numeric, 0), 7.9)::text,
  score_fees         = COALESCE(NULLIF(score_fees::numeric, 0), 8.0)::text,
  score_ux           = COALESCE(NULLIF(score_ux::numeric, 0), 8.5)::text,
  score_reliability  = COALESCE(NULLIF(score_reliability::numeric, 0), 9.0)::text,
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score::numeric, 0), 4.1)::text,
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3000),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['forex','cfd','indices','actions','crypto'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['tradingview','metatrader'] ELSE platforms END
WHERE slug = 'cmc-markets';
