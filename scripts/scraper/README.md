# ArbitrAge — Scraper Python

## Installation (une seule fois)

```bash
pip3 install playwright supabase-py
playwright install chromium
```

## Utilisation

```bash
# Sans Supabase (sauvegarde en local)
python3 scripts/scraper/scrape.py

# Avec Supabase (envoie les données)
SUPABASE_KEY=eyJ... python3 scripts/scraper/scrape.py
```

Les résultats sont toujours sauvegardés en local dans `scrape_results.json`.
Si SUPABASE_KEY est configuré, les données sont aussi poussées dans la table `brokers`.
