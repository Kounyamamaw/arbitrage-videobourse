-- ================================================================
-- ENRICHISSEMENT DES COURTIERS PAR CLAUDE (Anthropic)
-- Données basées sur les connaissances de Claude — à vérifier et
-- ajuster selon les évolutions tarifaires des courtiers.
-- Exécuter dans Supabase > SQL Editor
-- ================================================================

-- Helper : ne met à jour que si le champ est vide/nul/zéro
-- On utilise COALESCE pour ne pas écraser ce qui existe déjà

-- ── BOURSE DIRECT ──────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.5),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 9.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.9),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 1200),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV','PER'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais parmi les plus bas du marché français','PEA et CTO disponibles','Siège en France, IFU fourni'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Interface datée','Offre crypto absente'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Le courtier français le moins cher'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','options','futures','obligations'] ELSE asset_classes END
WHERE slug = 'bourse-direct';

-- ── FORTUNEO ───────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.3),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 8.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.7),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3500),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV','PER'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Banque + courtier dans une seule app','100 ordres gratuits si dépôt initial','IFU fourni, compte français'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais 1,95€/ordre au-delà des ordres offerts','Pas de crypto'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Banque en ligne avec courtage intégré'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'fortuneo';

-- ── INTERACTIVE BROKERS ────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 9.1),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 9.2),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 9.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.3),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 8500),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais ultra-bas (0,05% min 1$)','Accès à 150 marchés mondiaux','Interface ProRealTime disponible'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Interface complexe pour débutants','Compte à l''étranger (USA/Irlande)','Pas d''IFU — déclaration manuelle'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La référence mondiale pour l''investisseur exigeant'),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','options','futures','forex','cfd','obligations'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['prt','tradingview','metatrader','ninjatrader','atas'] ELSE platforms END
WHERE slug = 'interactive-brokers';

-- ── TRADE REPUBLIC ─────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.7),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 9.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 9.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.5),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 18000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['1€ par ordre, IBAN français depuis 2024','Carte bancaire avec cashback en actions','Plans DCA automatiques intégrés'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Offre limitée vs courtiers traditionnels','Pas d''IFU fourni (déclaration manuelle)','CTO séparé inexistant (solde mélangé)'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Néobanque & courtier — 1€ par ordre'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto','obligations'] ELSE asset_classes END
WHERE slug = 'trade-republic';

-- ── XTB ────────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.8),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 9.2),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.4),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 22000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['0% frais sur actions et ETF jusqu''à 100k€/mois','Fractions d''actions disponibles','Interface xStation intuitive'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA','Compte polonais — pas d''IFU','0,5% frais de change sur devise étrangère'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), '0% frais actions & ETF jusqu''à 100k€/mois'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','forex','cfd'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['tradingview'] ELSE platforms END
WHERE slug = 'xtb';

-- ── DEGIRO ─────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.0),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 8.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.2),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 35000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais très bas sur marchés européens','Large choix d''instruments','Interface simple'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA','Siège aux Pays-Bas — pas d''IFU','Frais de connexion marché'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Le courtier européen abordable'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','options','futures','obligations'] ELSE asset_classes END
WHERE slug = 'degiro';

-- ── BOURSOBANK ─────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.8),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 7.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.5),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 12000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 300),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO','AV'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Banque + bourse tout-en-un','IFU fourni, compte français','Application mobile primée'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais de courtage plus élevés que spécialistes','Pas de crypto','Dépôt minimum 300€'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La banque en ligne avec PEA et CTO intégrés'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','obligations'] ELSE asset_classes END
WHERE slug = 'boursobank';

-- ── SAXO BANQUE ────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.3),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 7.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 9.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 9.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.0),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 5000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 0),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['PEA','CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Plateforme SaxoTraderGO très complète','Accès options, futures, forex','Fractions d''actions disponibles'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais plus élevés que la concurrence','Compte danois — déclaration étranger','Complexe pour débutants'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Plateforme professionnelle multi-actifs'),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','options','futures','forex','cfd','obligations'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['tradingview'] ELSE platforms END
WHERE slug = 'saxo-banque';

-- ── IG ─────────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.1),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 7.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 9.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.2),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 7500),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 250),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Leader mondial CFD et spread betting','ProRealTime inclus gratuitement','Réglementé AMF en France'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais élevés sur actions au comptant','Pas de PEA','Produits à effet de levier risqués'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Leader mondial CFD — ProRealTime inclus'),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','forex','cfd','options','futures'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['prt','tradingview','metatrader'] ELSE platforms END
WHERE slug = 'ig';

-- ── ETORO ──────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.5),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 6.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 7.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.3),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 28000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 50),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Copy trading et social investing','Fractions d''actions dès 10$','Crypto et actions dans la même app'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Spread élevé (1% sur actions)','Pas de PEA','Frais de retrait 5$'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Copy trading et social investing'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto','forex','cfd'] ELSE asset_classes END
WHERE slug = 'etoro';

-- ── REVOLUT ────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.8),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 8.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 9.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 7.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.4),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 145000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 1),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['App tout-en-un banque + bourse + crypto','Carte bancaire multi-devises','DCA automatique programmable'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Pas de PEA','CTO séparé du compte courant inexistant','Frais sur plans premium'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Néobanque : carte, crypto, actions, DCA'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto'] ELSE asset_classes END
WHERE slug = 'revolut';

-- ── BITPANDA ───────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.2),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 6.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.8),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 8000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 25),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Crypto + actions + métaux dans une seule app','Plans d''épargne automatiques','Réglementé en Europe (Autriche)'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Spread sur les cryptos','Pas de PEA','Compte autrichien'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Crypto, actions et métaux précieux'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','crypto'] ELSE asset_classes END
WHERE slug = 'bitpanda';

-- ── BINANCE ────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.8),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 9.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.0),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 7.0),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.9),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 15000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 10),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Frais maker/taker les plus bas (0,1%)','Plus grand exchange crypto mondial','Staking et earn disponibles'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Incompatible TradingView pour résidents FR','Réglementation incertaine en Europe','Pas de compte titres (CTO/PEA)'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Le plus grand exchange crypto au monde'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'binance';

-- ── KRAKEN ─────────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.9),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 8.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.1),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 9000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 10),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Réputé pour sa sécurité','Frais compétitifs 0,16%/0,26%','Staking disponible'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Interface moins intuitive','Dépôt fiat limité en Europe','Pas de PEA/CTO'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Exchange crypto sécurisé et fiable'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug IN ('kraken', 'kraken-ie');

-- ── COINBASE ───────────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.3),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 6.0),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 3.5),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 12000),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 2),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CRYPTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Exchange coté en bourse — très sûr','Interface simple pour débutants','Carte Visa avec cashback crypto'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Frais élevés (1,49% à 3,99%)','Spread important sur petits ordres','Coinbase Pro supprimé (remplacé Advanced)'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'L''exchange crypto le plus accessible'),
  level              = COALESCE(NULLIF(level, ''), 'debutant'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, true),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['crypto'] ELSE asset_classes END
WHERE slug = 'coinbase';

-- ── WH SELFINVEST ──────────────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 7.8),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 7.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 8.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.1),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 800),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 2500),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['CTO'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Spécialiste futures et CFD','NinjaTrader et ProRealTime disponibles','Service client francophone de qualité'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Dépôt minimum élevé 2500€','Pas de PEA','Principalement orienté trading actif'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'Spécialiste futures, CFD et trading actif'),
  level              = COALESCE(NULLIF(level, ''), 'expert'),
  is_foreign         = COALESCE(is_foreign, true),
  provides_ifu       = COALESCE(provides_ifu, false),
  has_dca            = COALESCE(has_dca, false),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['actions','etf','forex','cfd','futures','options'] ELSE asset_classes END,
  platforms          = CASE WHEN platforms = '{}' OR platforms IS NULL THEN ARRAY['ninjatrader','prt','metatrader'] ELSE platforms END
WHERE slug IN ('wh-selfinvest', 'whselfinvest');

-- ── LINXEA (assurance-vie) ─────────────────────────────────────
UPDATE brokers SET
  score_overall      = COALESCE(NULLIF(score_overall, 0), 8.2),
  score_fees         = COALESCE(NULLIF(score_fees, 0), 8.5),
  score_ux           = COALESCE(NULLIF(score_ux, 0), 7.5),
  score_reliability  = COALESCE(NULLIF(score_reliability, 0), 8.5),
  trustpilot_score   = COALESCE(NULLIF(trustpilot_score, 0), 4.6),
  trustpilot_count   = COALESCE(NULLIF(trustpilot_count, 0), 3200),
  deposit_minimum    = COALESCE(NULLIF(deposit_minimum, 0), 500),
  accounts           = CASE WHEN accounts = '{}' OR accounts IS NULL THEN ARRAY['AV','PER'] ELSE accounts END,
  pros               = CASE WHEN pros = '{}' OR pros IS NULL THEN ARRAY['Meilleure assurance-vie en ligne','Frais de gestion parmi les plus bas (0,5%)','Large choix d''UC et ETF'] ELSE pros END,
  cons               = CASE WHEN cons = '{}' OR cons IS NULL THEN ARRAY['Uniquement AV et PER — pas de CTO/PEA','Interface moins moderne','Support parfois lent'] ELSE cons END,
  tagline            = COALESCE(NULLIF(tagline, ''), 'La référence assurance-vie en ligne'),
  level              = COALESCE(NULLIF(level, ''), 'intermediaire'),
  is_foreign         = COALESCE(is_foreign, false),
  provides_ifu       = COALESCE(provides_ifu, true),
  has_dca            = COALESCE(has_dca, true),
  has_fractions      = COALESCE(has_fractions, false),
  asset_classes      = CASE WHEN asset_classes = '{}' OR asset_classes IS NULL THEN ARRAY['etf','obligations','actions'] ELSE asset_classes END
WHERE slug = 'linxea';

-- ── AJOUTER COLONNES MANQUANTES SI NÉCESSAIRE ──────────────────
ALTER TABLE brokers
  ADD COLUMN IF NOT EXISTS asset_classes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS level text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_foreign boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS provides_ifu boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_dca boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_fractions boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Vérification finale
SELECT slug, name, score_overall, score_fees, level, is_foreign, provides_ifu
FROM brokers
ORDER BY score_overall DESC NULLS LAST;
