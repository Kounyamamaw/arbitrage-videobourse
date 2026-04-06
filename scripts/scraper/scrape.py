#!/usr/bin/env python3
"""
ArbitrAge — Scraper de données courtiers v2
Lit les partenaires depuis Supabase, scrape leurs pages tarifaires,
et push les résultats dans Supabase.

Installation :
    pip3 install --upgrade playwright supabase
    playwright install chromium

Usage :
    # Avec clé Supabase en env var
    SUPABASE_KEY="eyJ..." python3 scripts/scraper/scrape.py

    # Ou édite les constantes ci-dessous
"""

import json
import time
import re
import sys
from datetime import datetime

# ─── Config ────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://yzijbfkneuuonpsoomao.supabase.co"
SUPABASE_KEY = ""  # Mets ta clé anon ici OU passe-la en env var

import os
if os.environ.get("SUPABASE_KEY"):
    SUPABASE_KEY = os.environ["SUPABASE_KEY"]

# ─── Supabase client ──────────────────────────────────────────────────────
def get_supabase():
    if not SUPABASE_KEY:
        print("❌ SUPABASE_KEY non configurée.")
        print("   Soit édite SUPABASE_KEY dans le script,")
        print("   soit lance : SUPABASE_KEY=eyJ... python3 scripts/scraper/scrape.py")
        sys.exit(1)
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ─── Extraction des frais ─────────────────────────────────────────────────
def extract_fees(text, tables):
    """Extrait les frais depuis le texte et les tableaux d'une page."""
    fees = {}

    # Patterns de frais courants en français
    patterns = [
        # Frais de courtage
        (r"(\d+[,.]?\d*)\s*€\s*(?:par|/)\s*ordre", "frais_ordre_eur"),
        (r"(\d+[,.]?\d*)\s*%\s*(?:par|/)\s*ordre", "frais_ordre_pct"),
        (r"courtage[:\s]*(\d+[,.]?\d*)\s*€", "courtage_eur"),
        (r"courtage[:\s]*(\d+[,.]?\d*)\s*%", "courtage_pct"),
        (r"commission[s]?[:\s]*(\d+[,.]?\d*)\s*€", "commission_eur"),
        (r"commission[s]?[:\s]*(\d+[,.]?\d*)\s*%", "commission_pct"),
        # Frais spécifiques
        (r"droits?\s+de\s+garde[:\s]*(\d+[,.]?\d*)\s*€", "droits_garde"),
        (r"droits?\s+de\s+garde[:\s]*gratuit", "droits_garde_gratuit"),
        (r"inactivit[ée][:\s]*(\d+[,.]?\d*)\s*€", "inactivite_eur"),
        (r"(?:frais?\s+de\s+)?change[:\s]*(\d+[,.]?\d*)\s*%", "change_pct"),
        (r"retrait[:\s]*(\d+[,.]?\d*)\s*€", "retrait_eur"),
        (r"virement[:\s]*(\d+[,.]?\d*)\s*€", "virement_eur"),
        # Ordres spécifiques
        (r"(?:action|bourse)\s+(?:fr|france|euronext)[:\s]*(\d+[,.]?\d*)\s*€", "ordre_fr_eur"),
        (r"(?:action|bourse)\s+(?:us|usa|nyse|nasdaq)[:\s]*(\d+[,.]?\d*)\s*€", "ordre_us_eur"),
        (r"(?:action|bourse)\s+(?:us|usa|nyse|nasdaq)[:\s]*(\d+[,.]?\d*)\s*%", "ordre_us_pct"),
        # ETF
        (r"etf[:\s]*(\d+[,.]?\d*)\s*€", "etf_eur"),
        (r"etf[:\s]*(?:0|gratuit|sans)", "etf_gratuit"),
        # Dépôt minimum
        (r"d[ée]p[oô]t\s+minimum[:\s]*(\d+[,.]?\d*)\s*€", "depot_min"),
        (r"d[ée]p[oô]t\s+minimum[:\s]*(?:aucun|0|pas)", "depot_min_zero"),
        # PEA
        (r"pea[:\s]*(\d+[,.]?\d*)\s*€", "pea_frais"),
        (r"pea[:\s]*disponible", "pea_dispo"),
    ]

    text_lower = text.lower()
    for pattern, key in patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            val = matches[0] if isinstance(matches[0], str) else matches[0]
            fees[key] = val.replace(",", ".") if isinstance(val, str) and val else "true"

    # Analyser les tableaux pour trouver des paliers de frais
    fee_tiers = []
    for table in tables[:5]:
        for row in table:
            # Chercher des lignes avec montant + frais
            amounts = re.findall(r"(\d[\d\s,.]*)\s*€", " ".join(row))
            percentages = re.findall(r"(\d+[,.]?\d*)\s*%", " ".join(row))
            if amounts or percentages:
                fee_tiers.append(row)

    if fee_tiers:
        fees["_tiers"] = fee_tiers[:10]

    return fees


def map_fees_to_broker(fees):
    """Convertit les frais extraits en champs broker Supabase."""
    update = {}

    # Droits de garde
    if "droits_garde" in fees:
        try:
            update["custody_fee"] = float(fees["droits_garde"])
        except (ValueError, TypeError):
            pass
    if "droits_garde_gratuit" in fees:
        update["custody_fee"] = 0
        update["custody_fee_details"] = "Gratuit"

    # Frais de change
    if "change_pct" in fees:
        try:
            update["currency_fee"] = float(fees["change_pct"])
        except (ValueError, TypeError):
            pass

    # Frais d'inactivité
    if "inactivite_eur" in fees:
        try:
            update["inactivity_fee"] = float(fees["inactivite_eur"])
        except (ValueError, TypeError):
            pass

    # Dépôt minimum
    if "depot_min" in fees:
        try:
            update["deposit_minimum"] = float(fees["depot_min"])
        except (ValueError, TypeError):
            pass
    if "depot_min_zero" in fees:
        update["deposit_minimum"] = 0

    return update


# ─── Scraping d'un courtier ───────────────────────────────────────────────
def scrape_broker(page, broker):
    """Scrape la page tarifaire d'un courtier."""
    url = broker.get("pricing_url") or broker.get("website")
    if not url:
        return {"status": "skip", "reason": "Pas d'URL", "slug": broker["slug"]}

    # Ajouter https:// si manquant
    if not url.startswith("http"):
        url = "https://" + url

    name = broker["name"]
    print(f"\n  🔍 {name}")
    print(f"     URL: {url}")

    try:
        page.goto(url, timeout=30000, wait_until="domcontentloaded")
        time.sleep(3)  # Attendre le rendu JS

        # Accepter les cookies si popup
        try:
            for selector in [
                "button:has-text('Accepter')",
                "button:has-text('Accept')",
                "button:has-text('OK')",
                "button:has-text('Tout accepter')",
                "[id*='cookie'] button",
                "[class*='cookie'] button",
            ]:
                btn = page.query_selector(selector)
                if btn and btn.is_visible():
                    btn.click()
                    time.sleep(1)
                    break
        except Exception:
            pass

        # Récupérer le texte visible
        text = page.inner_text("body")

        # Récupérer les tableaux
        tables = []
        for table_el in page.query_selector_all("table"):
            rows = []
            for tr in table_el.query_selector_all("tr"):
                cells = [td.inner_text().strip() for td in tr.query_selector_all("td, th")]
                if cells and any(c for c in cells):
                    rows.append(cells)
            if rows:
                tables.append(rows)

        # Extraire les frais
        fees = extract_fees(text, tables)
        broker_update = map_fees_to_broker(fees)

        fields_found = len([k for k in fees if not k.startswith("_")])
        print(f"     ✅ {fields_found} frais détectés")
        if fees:
            for k, v in fees.items():
                if not k.startswith("_"):
                    print(f"        • {k}: {v}")

        return {
            "slug": broker["slug"],
            "name": name,
            "url": url,
            "status": "success",
            "fields_found": fields_found,
            "fees_extracted": fees,
            "broker_update": broker_update,
            "tables_count": len(tables),
            "text_length": len(text),
            "scraped_at": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"     ❌ Erreur: {e}")
        return {
            "slug": broker["slug"],
            "name": name,
            "url": url,
            "status": "error",
            "error": str(e),
            "scraped_at": datetime.now().isoformat(),
        }


# ─── Main ─────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  ArbitrAge — Scraper v2.0")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 60)

    # 1. Connexion Supabase
    print("\n📡 Connexion à Supabase...")
    sb = get_supabase()

    # 2. Lire les partenaires depuis Supabase
    print("📋 Récupération des partenaires...")
    response = sb.table("brokers").select("slug, name, website, pricing_url").order("name").execute()
    brokers = response.data

    if not brokers:
        print("❌ Aucun partenaire trouvé dans Supabase.")
        print("   As-tu exécuté le seed ? (npx tsx supabase/seed.ts)")
        return

    print(f"   {len(brokers)} partenaires trouvés\n")

    # 3. Lancer Playwright
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Playwright non installé.")
        print("   pip3 install --upgrade playwright")
        print("   playwright install chromium")
        return

    results = []

    with sync_playwright() as p:
        print("🌐 Lancement du navigateur...")
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
            locale="fr-FR",
        )
        page = context.new_page()

        for broker in brokers:
            result = scrape_broker(page, broker)
            results.append(result)
            time.sleep(2)  # Pause entre chaque site

        browser.close()

    # 4. Push les résultats dans Supabase
    print("\n" + "=" * 60)
    print("📤 Envoi des résultats dans Supabase...")

    updated = 0
    for result in results:
        if result["status"] == "success":
            # Update broker data
            broker_update = result.get("broker_update", {})
            if broker_update:
                broker_update["updated_at"] = datetime.now().isoformat()
                try:
                    sb.table("brokers").update(broker_update).eq("slug", result["slug"]).execute()
                    updated += 1
                    print(f"   ✅ {result['name']} — {len(broker_update)-1} champs mis à jour")
                except Exception as e:
                    print(f"   ❌ {result['name']} — erreur update: {e}")
            else:
                print(f"   ⚪ {result['name']} — aucune donnée exploitable automatiquement")

            # Log le scrape
            try:
                sb.table("scrape_logs").insert({
                    "broker_slug": result["slug"],
                    "status": "success",
                    "fields_found": result["fields_found"],
                    "fees_extracted": {k: v for k, v in result.get("fees_extracted", {}).items() if not k.startswith("_")},
                    "raw_text_length": result.get("text_length", 0),
                }).execute()
            except Exception:
                pass  # Table might not exist yet

        elif result["status"] == "error":
            try:
                sb.table("scrape_logs").insert({
                    "broker_slug": result["slug"],
                    "status": "error",
                    "error_message": result.get("error", ""),
                }).execute()
            except Exception:
                pass

    # 5. Résumé
    success = sum(1 for r in results if r["status"] == "success")
    errors = sum(1 for r in results if r["status"] == "error")
    skipped = sum(1 for r in results if r["status"] == "skip")

    print(f"\n{'=' * 60}")
    print(f"  Résultat final")
    print(f"  ✅ Scrapés : {success}/{len(results)}")
    print(f"  📝 Mis à jour : {updated}")
    print(f"  ❌ Erreurs : {errors}")
    print(f"  ⏭  Ignorés : {skipped}")
    print(f"{'=' * 60}")

    # 6. Sauvegarde locale
    backup = {
        "date": datetime.now().isoformat(),
        "total": len(results),
        "success": success,
        "updated": updated,
        "results": results,
    }
    with open("scrape_results.json", "w") as f:
        json.dump(backup, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n💾 Backup local : scrape_results.json")


if __name__ == "__main__":
    main()
