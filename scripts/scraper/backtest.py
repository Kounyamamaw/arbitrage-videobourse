#!/usr/bin/env python3
"""
ArbitrAge — Backtest Scraper IA
Teste l'extraction de frais sur 3 courtiers connus pour valider la fiabilité.

Usage:
    GROQ_KEY="gsk_..." python3 backtest.py
    
Prérequis:
    pip3 install --upgrade playwright httpx
    playwright install chromium
"""

import os
import sys
import json
import time
import httpx

# ─── Config ───
GROQ_KEY = os.environ.get("GROQ_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# 3 courtiers avec frais CONNUS pour comparer
BACKTEST_BROKERS = [
    {
        "name": "Bourse Direct",
        "url": "https://www.boursedirect.fr/fr/tarifs",
        "expected": {
            "frais_ordre_fr_0_500": {"value": 0.99, "unit": "EUR", "type": "flat"},
            "frais_ordre_fr_500_2000": {"value": 1.90, "unit": "EUR", "type": "flat"},
            "frais_ordre_fr_2000_plus": {"value": 0.09, "unit": "%", "type": "percentage"},
            "droits_garde": {"value": 0, "unit": "EUR"},
            "frais_inactivite": {"value": 0, "unit": "EUR"},
        }
    },
    {
        "name": "XTB",
        "url": "https://www.xtb.com/fr/taux-et-frais",
        "expected": {
            "frais_actions_etf": {"value": 0, "unit": "%", "note": "0% jusqu'à 100k€/mois"},
            "frais_change": {"value": 0.50, "unit": "%"},
        }
    },
    {
        "name": "Trade Republic",
        "url": "https://traderepublic.com/fr-fr/pricing",
        "expected": {
            "frais_ordre": {"value": 1, "unit": "EUR", "type": "flat"},
            "droits_garde": {"value": 0, "unit": "EUR"},
        }
    },
]

EXTRACTION_PROMPT = """Tu es un extracteur de données financières. Tu reçois le contenu texte d'une page tarifaire d'un courtier en bourse.

RÈGLES STRICTES :
1. Extrais UNIQUEMENT les frais que tu trouves EXPLICITEMENT dans le texte
2. N'invente AUCUN frais — si un frais n'est pas mentionné, mets null
3. N'extrapole pas — si le texte dit "à partir de 0,99€", note exactement ça
4. Préserve les conditions (paliers, seuils, durées)

Retourne un JSON avec cette structure exacte :
{
  "courtier": "nom du courtier",
  "frais_courtage": {
    "france": [
      {"min_eur": 0, "max_eur": 500, "montant": 0.99, "unite": "EUR", "type": "flat"},
      {"min_eur": 500, "max_eur": 2000, "montant": 1.90, "unite": "EUR", "type": "flat"}
    ],
    "europe": [...],
    "usa": [...]
  },
  "droits_garde": {"montant": null, "unite": "EUR", "details": null},
  "frais_inactivite": {"montant": null, "unite": "EUR", "conditions": null},
  "frais_change": {"montant": null, "unite": "%", "details": null},
  "frais_retrait": {"montant": null, "unite": "EUR"},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "comptes_disponibles": [],
  "offre_speciale": null,
  "source_url": "url de la page",
  "confiance": "haute/moyenne/basse",
  "notes": "commentaires sur ce qui n'a pas pu être extrait"
}

IMPORTANT : Le champ "confiance" doit refléter ta certitude :
- "haute" = les frais sont clairement affichés dans le texte
- "moyenne" = certains frais sont ambigus ou partiels  
- "basse" = peu de données trouvées

Voici le contenu de la page tarifaire :
"""


def scrape_page(url, name):
    """Scrape une page avec Playwright et retourne le texte visible."""
    print(f"\n{'='*50}")
    print(f"🔍 Scraping {name}...")
    print(f"   URL: {url}")
    
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ playwright non installé : pip3 install --upgrade playwright")
        return None

    try:
        with sync_playwright() as p:
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
            
            page.goto(url, timeout=30000, wait_until="networkidle")
            print("   ⏳ Attente du rendu JS (8s)...")
            time.sleep(8)
            
            # Accept cookies
            for selector in [
                "button:has-text('Accepter')",
                "button:has-text('Tout accepter')",
                "button:has-text('Accept')",
                "[id*='cookie'] button",
            ]:
                try:
                    btn = page.query_selector(selector)
                    if btn and btn.is_visible():
                        btn.click()
                        time.sleep(2)
                        break
                except:
                    pass
            
            # Scroll down to load lazy content
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(3)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)
            
            # Get visible text
            text = page.inner_text("body")
            
            # Also extract tables as structured text
            tables_text = ""
            for table in page.query_selector_all("table"):
                try:
                    tables_text += "\n[TABLEAU]\n" + table.inner_text() + "\n[/TABLEAU]\n"
                except:
                    pass
            
            browser.close()
            
            full_text = text
            if tables_text:
                full_text += "\n\n--- TABLEAUX TROUVÉS ---\n" + tables_text
            
            print(f"   ✅ {len(text)} caractères extraits")
            if tables_text:
                print(f"   📊 Tableaux trouvés")
            
            return full_text
            
    except Exception as e:
        print(f"   ❌ Erreur Playwright: {e}")
        return None


def extract_with_groq(text, broker_name, url):
    """Envoie le texte à Groq pour extraction structurée."""
    if not GROQ_KEY:
        print("❌ GROQ_KEY non configurée")
        sys.exit(1)
    
    # Truncate text if too long (Groq has token limits)
    max_chars = 12000
    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n[... texte tronqué ...]"
    
    print(f"   🤖 Envoi à Groq ({len(text)} chars)...")
    
    prompt = EXTRACTION_PROMPT + f"\n\nCourtier : {broker_name}\nURL : {url}\n\n---\n{text}\n---\n\nRéponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après."
    
    try:
        response = httpx.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 2000,
                "temperature": 0.1,  # Très bas pour être factuel
            },
            timeout=30.0,
        )
        
        if response.status_code != 200:
            print(f"   ❌ Groq erreur {response.status_code}: {response.text[:200]}")
            return None
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON from response (handle markdown code blocks)
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        result = json.loads(content)
        print(f"   ✅ JSON extrait avec succès")
        print(f"   📊 Confiance: {result.get('confiance', '?')}")
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"   ❌ JSON invalide retourné par Groq: {e}")
        print(f"   Contenu: {content[:500]}")
        return None
    except Exception as e:
        print(f"   ❌ Erreur Groq: {e}")
        return None


def compare_results(extracted, expected, broker_name):
    """Compare les frais extraits avec les frais attendus."""
    print(f"\n   📋 COMPARAISON — {broker_name}")
    print(f"   {'─'*40}")
    
    matches = 0
    total = 0
    
    for key, exp in expected.items():
        total += 1
        exp_val = exp.get("value")
        
        # Try to find the corresponding value in extracted data
        found = False
        ext_val = None
        
        # Check frais_courtage.france
        if "ordre_fr" in key and extracted.get("frais_courtage", {}).get("france"):
            tiers = extracted["frais_courtage"]["france"]
            for tier in tiers:
                if isinstance(tier, dict) and tier.get("montant") is not None:
                    if abs(float(tier["montant"]) - exp_val) < 0.01:
                        found = True
                        ext_val = tier["montant"]
                        break
        
        # Check droits_garde
        if "droits_garde" in key and extracted.get("droits_garde"):
            dg = extracted["droits_garde"]
            if isinstance(dg, dict) and dg.get("montant") is not None:
                ext_val = dg["montant"]
                found = abs(float(ext_val) - exp_val) < 0.01
        
        # Check frais_inactivite
        if "inactivite" in key and extracted.get("frais_inactivite"):
            fi = extracted["frais_inactivite"]
            if isinstance(fi, dict) and fi.get("montant") is not None:
                ext_val = fi["montant"]
                found = abs(float(ext_val) - exp_val) < 0.01
        
        # Check frais_change
        if "change" in key and extracted.get("frais_change"):
            fc = extracted["frais_change"]
            if isinstance(fc, dict) and fc.get("montant") is not None:
                ext_val = fc["montant"]
                found = abs(float(ext_val) - exp_val) < 0.5  # More tolerance for %
        
        # Check frais_ordre (flat)
        if key == "frais_ordre" and extracted.get("frais_courtage", {}).get("france"):
            tiers = extracted["frais_courtage"]["france"]
            if tiers and isinstance(tiers[0], dict):
                ext_val = tiers[0].get("montant")
                if ext_val is not None:
                    found = abs(float(ext_val) - exp_val) < 0.1
        
        # Check frais_actions_etf
        if "actions_etf" in key and extracted.get("frais_courtage", {}).get("france"):
            tiers = extracted["frais_courtage"]["france"]
            if tiers and isinstance(tiers[0], dict):
                ext_val = tiers[0].get("montant")
                if ext_val is not None:
                    found = float(ext_val) == exp_val
        
        if found:
            matches += 1
            print(f"   ✅ {key}: attendu={exp_val} → trouvé={ext_val}")
        else:
            print(f"   ❌ {key}: attendu={exp_val} → trouvé={ext_val or 'NON TROUVÉ'}")
    
    accuracy = (matches / total * 100) if total > 0 else 0
    print(f"\n   🎯 Précision: {matches}/{total} ({accuracy:.0f}%)")
    return accuracy


def main():
    if not GROQ_KEY:
        print("❌ GROQ_KEY non configurée.")
        print("   GROQ_KEY='gsk_...' python3 backtest.py")
        sys.exit(1)
    
    print("=" * 50)
    print("  ArbitrAge — Backtest Extracteur IA")
    print("  Test sur 3 courtiers connus")
    print("=" * 50)
    
    results = []
    
    for broker in BACKTEST_BROKERS:
        # 1. Scrape
        text = scrape_page(broker["url"], broker["name"])
        if not text:
            results.append({"broker": broker["name"], "accuracy": 0, "status": "scrape_failed"})
            continue
        
        # 2. Extract with Groq
        extracted = extract_with_groq(text, broker["name"], broker["url"])
        if not extracted:
            results.append({"broker": broker["name"], "accuracy": 0, "status": "extraction_failed"})
            continue
        
        # 3. Compare
        accuracy = compare_results(extracted, broker["expected"], broker["name"])
        results.append({
            "broker": broker["name"],
            "accuracy": accuracy,
            "status": "success",
            "confiance": extracted.get("confiance"),
            "extracted": extracted,
        })
        
        time.sleep(2)  # Pause between brokers
    
    # Final summary
    print(f"\n{'='*50}")
    print(f"  RÉSUMÉ DU BACKTEST")
    print(f"{'='*50}")
    for r in results:
        status_icon = "✅" if r["accuracy"] >= 60 else "⚠️" if r["accuracy"] >= 30 else "❌"
        print(f"  {status_icon} {r['broker']}: {r['accuracy']:.0f}% — {r['status']} (confiance: {r.get('confiance', '?')})")
    
    avg = sum(r["accuracy"] for r in results) / len(results) if results else 0
    print(f"\n  📊 Précision moyenne: {avg:.0f}%")
    
    if avg >= 60:
        print(f"  ✅ FIABILITÉ VALIDÉE — on peut déployer sur tous les courtiers")
    elif avg >= 30:
        print(f"  ⚠️ FIABILITÉ PARTIELLE — à améliorer avant déploiement")
    else:
        print(f"  ❌ FIABILITÉ INSUFFISANTE — approche à revoir")
    
    # Save full results
    with open("backtest_results.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n  💾 Détails: backtest_results.json")


if __name__ == "__main__":
    main()
