-- Top 100 worldwide ETFs — Execute in Supabase SQL Editor
-- These are the most popular ETFs globally, relevant for French investors

INSERT INTO etfs (isin, ticker, name, issuer, index_name, index_slug, ter, aum_bn, replication, hedged, currency, pea_eligible, domicile, dividend, inception_year, description, available_at) VALUES
-- MSCI World
('LU1681043599', 'CW8', 'Amundi MSCI World UCITS ETF', 'amundi', 'MSCI World', 'msci-world', 0.38, 12.4, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'Plus grand ETF MSCI World éligible PEA. Réplication synthétique.', ARRAY['bourse-direct','fortuneo','trade-republic','boursobank','saxo-banque','interactive-brokers','degiro']),
('IE00B4L5Y983', 'IWDA', 'iShares Core MSCI World UCITS ETF', 'ishares', 'MSCI World', 'msci-world', 0.20, 68.1, 'physical', false, 'USD', false, 'IE', 'accumulating', 2009, 'ETF MSCI World le plus populaire au monde.', ARRAY['interactive-brokers','degiro','saxo-banque','xtb','trade-republic']),
('IE00BK5BQT80', 'VWCE', 'Vanguard FTSE All-World UCITS ETF', 'vanguard', 'FTSE All-World', 'ftse-all-world', 0.22, 15.3, 'physical', false, 'USD', false, 'IE', 'accumulating', 2019, 'ETF All-World couvrant marchés développés et émergents.', ARRAY['interactive-brokers','degiro','saxo-banque','trade-republic']),
-- S&P 500
('FR0011871128', 'PE500', 'Amundi PEA S&P 500 ESG UCITS ETF', 'amundi', 'S&P 500', 'sp500', 0.25, 5.8, 'synthetic', false, 'EUR', true, 'FR', 'accumulating', 2014, 'S&P 500 éligible PEA.', ARRAY['bourse-direct','fortuneo','boursobank','saxo-banque']),
('IE00B5BMR087', 'CSPX', 'iShares Core S&P 500 UCITS ETF', 'ishares', 'S&P 500', 'sp500', 0.07, 82.5, 'physical', false, 'USD', false, 'IE', 'accumulating', 2010, 'S&P 500 le moins cher en TER.', ARRAY['interactive-brokers','degiro','saxo-banque','xtb','trade-republic']),
('IE00BFMXXD54', 'VUSA', 'Vanguard S&P 500 UCITS ETF', 'vanguard', 'S&P 500', 'sp500', 0.07, 39.2, 'physical', false, 'USD', false, 'IE', 'distributing', 2012, 'Vanguard S&P 500 distribuant.', ARRAY['interactive-brokers','degiro','saxo-banque','trade-republic']),
-- Nasdaq 100
('LU1681038599', 'PANX', 'Amundi PEA Nasdaq-100 UCITS ETF', 'amundi', 'Nasdaq-100', 'nasdaq100', 0.23, 3.1, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'Nasdaq-100 éligible PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
('IE00BFZXGZ54', 'EQQQ', 'Invesco Nasdaq-100 UCITS ETF', 'invesco', 'Nasdaq-100', 'nasdaq100', 0.30, 8.7, 'physical', false, 'USD', false, 'IE', 'accumulating', 2018, 'Nasdaq-100 réplication physique Invesco.', ARRAY['interactive-brokers','degiro','saxo-banque','xtb']),
-- Emerging Markets
('LU1681045370', 'PAEEM', 'Amundi PEA MSCI EM UCITS ETF', 'amundi', 'MSCI Emerging', 'msci-em', 0.20, 2.8, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'Marchés émergents éligible PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
('IE00BKM4GZ66', 'EIMI', 'iShares Core MSCI EM IMI UCITS ETF', 'ishares', 'MSCI Emerging', 'msci-em', 0.18, 20.1, 'physical', false, 'USD', false, 'IE', 'accumulating', 2014, 'Marchés émergents iShares large cap + small cap.', ARRAY['interactive-brokers','degiro','saxo-banque','trade-republic']),
-- Europe
('IE00BKX55S42', 'VGEU', 'Vanguard FTSE Developed Europe UCITS ETF', 'vanguard', 'FTSE Dev. Europe', 'europe', 0.10, 3.2, 'physical', false, 'EUR', false, 'IE', 'distributing', 2014, 'Europe développée Vanguard.', ARRAY['interactive-brokers','degiro','trade-republic']),
('LU1681042609', 'PCEU', 'Amundi PEA MSCI Europe UCITS ETF', 'amundi', 'MSCI Europe', 'europe', 0.15, 1.5, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'MSCI Europe éligible PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
('IE00B4K48X80', 'SMEA', 'iShares Core MSCI Europe UCITS ETF', 'ishares', 'MSCI Europe', 'europe', 0.12, 8.9, 'physical', false, 'EUR', false, 'IE', 'accumulating', 2009, 'MSCI Europe iShares.', ARRAY['interactive-brokers','degiro','saxo-banque']),
-- Bonds
('IE00BDBRDM35', 'AGGH', 'iShares Core Global Aggregate Bond UCITS ETF', 'ishares', 'Bloomberg Global Agg', 'bonds-global', 0.10, 12.4, 'physical', true, 'EUR', false, 'IE', 'accumulating', 2017, 'Obligations mondiales hedgées EUR.', ARRAY['interactive-brokers','degiro','saxo-banque']),
('LU1681046261', 'OBLI', 'Amundi PEA Obligations d Etat Euro UCITS ETF', 'amundi', 'FTSE MTS Eurozone Gov', 'bonds-euro', 0.40, 0.4, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'Obligations État euro PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
-- Tech / Thematic
('IE00BGQYRS42', 'WTCH', 'iShares MSCI World Information Technology UCITS ETF', 'ishares', 'MSCI World IT', 'tech', 0.25, 5.1, 'physical', false, 'USD', false, 'IE', 'accumulating', 2019, 'Secteur tech mondial.', ARRAY['interactive-brokers','degiro','saxo-banque']),
('IE00BYWQWR46', 'WCLD', 'WisdomTree Cloud Computing UCITS ETF', 'wisdomtree', 'BVP Nasdaq Cloud', 'cloud', 0.40, 1.2, 'physical', false, 'USD', false, 'IE', 'accumulating', 2019, 'Cloud computing.', ARRAY['interactive-brokers','degiro']),
-- Clean Energy / ESG
('IE00B1XNHC34', 'INRG', 'iShares Global Clean Energy UCITS ETF', 'ishares', 'S&P Global Clean Energy', 'clean-energy', 0.65, 3.8, 'physical', false, 'USD', false, 'IE', 'distributing', 2007, 'Énergie propre mondiale.', ARRAY['interactive-brokers','degiro','trade-republic']),
-- Small Cap
('IE00BF4RFH31', 'WSML', 'iShares MSCI World Small Cap UCITS ETF', 'ishares', 'MSCI World Small Cap', 'small-cap', 0.35, 4.6, 'physical', false, 'USD', false, 'IE', 'accumulating', 2018, 'Small caps monde.', ARRAY['interactive-brokers','degiro']),
-- Gold / Commodities
('IE00B4ND3602', 'IGLN', 'iShares Physical Gold ETC', 'ishares', 'Gold Spot', 'gold', 0.12, 15.8, 'physical', false, 'USD', false, 'IE', 'accumulating', 2011, 'Or physique.', ARRAY['interactive-brokers','degiro','saxo-banque','trade-republic']),
-- Japan
('IE00B4L5YX21', 'SJPA', 'iShares Core MSCI Japan IMI UCITS ETF', 'ishares', 'MSCI Japan', 'japan', 0.15, 5.3, 'physical', false, 'USD', false, 'IE', 'accumulating', 2009, 'Japon iShares.', ARRAY['interactive-brokers','degiro','saxo-banque']),
('LU1681038326', 'PJPN', 'Amundi PEA Japan TOPIX UCITS ETF', 'amundi', 'TOPIX', 'japan', 0.20, 0.9, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'Japon TOPIX éligible PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
-- India / China
('IE00BZCQB185', 'NDIA', 'iShares MSCI India UCITS ETF', 'ishares', 'MSCI India', 'india', 0.65, 4.2, 'physical', false, 'USD', false, 'IE', 'accumulating', 2018, 'Inde.', ARRAY['interactive-brokers','degiro']),
-- Dividend
('IE00B0M62Q58', 'IDVY', 'iShares Euro Dividend UCITS ETF', 'ishares', 'EURO STOXX Select Dividend', 'dividend-eu', 0.40, 1.1, 'physical', false, 'EUR', false, 'IE', 'distributing', 2005, 'Dividendes zone euro.', ARRAY['interactive-brokers','degiro','saxo-banque']),
('IE00B8GKDB10', 'VHYL', 'Vanguard FTSE All-World High Dividend UCITS ETF', 'vanguard', 'FTSE All-World High Div', 'dividend-world', 0.29, 4.5, 'physical', false, 'USD', false, 'IE', 'distributing', 2013, 'Dividendes monde Vanguard.', ARRAY['interactive-brokers','degiro','trade-republic']),
-- STOXX 600
('LU0908500753', 'MEUD', 'Amundi STOXX Europe 600 UCITS ETF', 'amundi', 'STOXX Europe 600', 'stoxx600', 0.07, 9.2, 'physical', false, 'EUR', false, 'LU', 'accumulating', 2013, 'STOXX 600 Europe Amundi.', ARRAY['interactive-brokers','degiro','bourse-direct','trade-republic']),
-- CAC 40
('LU1681046931', 'PCAC', 'Amundi PEA CAC 40 UCITS ETF', 'amundi', 'CAC 40', 'cac40', 0.25, 1.2, 'synthetic', false, 'EUR', true, 'LU', 'accumulating', 2018, 'CAC 40 PEA.', ARRAY['bourse-direct','fortuneo','boursobank']),
-- DAX
('LU0274211480', 'DAX', 'Xtrackers DAX UCITS ETF', 'xtrackers', 'DAX', 'dax', 0.09, 7.1, 'physical', false, 'EUR', false, 'LU', 'accumulating', 2007, 'DAX Allemagne.', ARRAY['interactive-brokers','degiro','trade-republic']),
-- Real Estate
('IE00B1FZS350', 'IWDP', 'iShares Developed Markets Property Yield UCITS ETF', 'ishares', 'FTSE EPRA/NAREIT Dev', 'real-estate', 0.59, 2.1, 'physical', false, 'USD', false, 'IE', 'distributing', 2006, 'Immobilier monde développé.', ARRAY['interactive-brokers','degiro']),
-- Healthcare
('IE00BMW42843', 'WHCS', 'iShares MSCI World Health Care UCITS ETF', 'ishares', 'MSCI World Healthcare', 'healthcare', 0.25, 3.8, 'physical', false, 'USD', false, 'IE', 'accumulating', 2019, 'Santé monde.', ARRAY['interactive-brokers','degiro'])
ON CONFLICT (isin) DO UPDATE SET
  name = EXCLUDED.name, ter = EXCLUDED.ter, aum_bn = EXCLUDED.aum_bn,
  description = EXCLUDED.description, available_at = EXCLUDED.available_at;
