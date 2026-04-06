#!/usr/bin/env python3
"""
ArbitrAge — Scraper v3 (Google + PDF + Web + Groq)

Flow:
1. Lit les partenaires depuis Supabase
2. Pour chaque: cherche "[courtier] tarifs frais PDF" sur Google
3. Si PDF trouvé → extrait texte avec pdfplumber
4. Sinon → scrape la page web avec Playwright
5. Envoie le contenu à Groq pour structuration
6. Push les données structurées dans Supabase

Usage:
    GROQ_KEY="gsk_..." SUPABASE_KEY="eyJ..." python3 scripts/scraper/scrape_v3.py

Prérequis:
    pip3 install --upgrade playwright httpx pdfplumber
    playwright install chromium
"""

import os, sys, json, time, re, tempfile
from datetime import datetime

GROQ_KEY = os.environ.get("GROQ_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://yzijbfkneuuonpsoomao.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

EXTRACTION_PROMPT = """Tu es un extracteur de données financières STRICT.
Tu reçois le contenu d'un document (page web ou PDF) d'un courtier en bourse.

RÈGLES :
1. Extrais UNIQUEMENT ce qui est EXPLICITEMENT écrit dans le texte
2. N'invente RIEN — si un frais n'apparaît pas, mets null
3. Préserve les paliers, conditions et notes
4. Si tu doutes, mets null et explique dans "notes"

Retourne ce JSON EXACT (rien d'autre) :
{
  "courtier": "nom",
  "frais_courtage": {
    "france": [{"min_eur": 0, "max_eur": 500, "montant": 0.99, "unite": "EUR", "type": "flat"}],
    "europe": [],
    "usa": []
  },
  "droits_garde": {"montant": null, "unite": "EUR", "details": null},
  "frais_inactivite": {"montant": null, "unite": "EUR", "conditions": null},
  "frais_change": {"montant": null, "unite": "%", "details": null},
  "frais_retrait": {"montant": null, "unite": "EUR"},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "comptes_disponibles": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui n'a pas pu être extrait"
}
"""


def get_supabase():
    if not SUPABASE_KEY:
        print("❌ SUPABASE_KEY manquante"); sys.exit(1)
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def google_search(query, num=5):
    """Recherche Google et retourne les URLs."""
    import httpx
    print(f"   🔎 Google: {query}")
    try:
        resp = httpx.get(
            "https://www.google.com/search",
            params={"q": query, "num": num, "hl": "fr"},
            headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"},
            follow_redirects=True, timeout=15
        )
        urls = re.findall(r'href="(https?://[^"&]+)"', resp.text)
        # Filter out google URLs
        urls = [u for u in urls if "google" not in u and "youtube" not in u]
        # Prioritize PDFs
        pdfs = [u for u in urls if u.lower().endswith(".pdf")]
        others = [u for u in urls if not u.lower().endswith(".pdf")]
        result = pdfs + others
        print(f"   📄 {len(pdfs)} PDF(s) trouvé(s), {len(others)} pages web")
        return result[:8]
    except Exception as e:
        print(f"   ⚠️ Google search failed: {e}")
        return []


def extract_pdf(url):
    """Télécharge un PDF et extrait le texte."""
    import httpx, pdfplumber
    print(f"   📥 Téléchargement PDF: {url[:80]}...")
    try:
        resp = httpx.get(url, follow_redirects=True, timeout=30,
                         headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200 or b"%PDF" not in resp.content[:10]:
            print(f"   ⚠️ Pas un PDF valide")
            return None
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(resp.content)
            tmp_path = f.name
        text = ""
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages[:15]:  # Max 15 pages
                t = page.extract_text()
                if t: text += t + "\n"
        os.unlink(tmp_path)
        print(f"   ✅ PDF: {len(text)} caractères extraits")
        return text if len(text) > 100 else None
    except Exception as e:
        print(f"   ⚠️ PDF extraction failed: {e}")
        return None


def scrape_web(url):
    """Scrape une page web avec Playwright."""
    from playwright.sync_api import sync_playwright
    print(f"   🌐 Scraping: {url[:80]}...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-gpu"])
            ctx = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                viewport={"width": 1920, "height": 1080}, locale="fr-FR"
            )
            page = ctx.new_page()
            page.goto(url, timeout=25000, wait_until="domcontentloaded")
            time.sleep(6)
            # Accept cookies
            for sel in ["button:has-text('Accepter')", "button:has-text('Tout accepter')", "[id*='cookie'] button"]:
                try:
                    btn = page.query_selector(sel)
                    if btn and btn.is_visible(): btn.click(); time.sleep(1); break
                except: pass
            # Scroll
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            text = page.inner_text("body")
            # Tables
            for table in page.query_selector_all("table"):
                try: text += "\n[TABLE]\n" + table.inner_text() + "\n"
                except: pass
            browser.close()
            print(f"   ✅ Web: {len(text)} caractères")
            return text if len(text) > 200 else None
    except Exception as e:
        print(f"   ⚠️ Web scrape failed: {e}")
        return None


def ask_groq(text, broker_name):
    """Envoie le contenu à Groq pour extraction."""
    import httpx
    if not GROQ_KEY:
        print("❌ GROQ_KEY manquante"); return None
    text = text[:14000]  # Token limit
    print(f"   🤖 Groq analyse ({len(text)} chars)...")
    try:
        resp = httpx.post(GROQ_URL, headers={
            "Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"
        }, json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": f"{EXTRACTION_PROMPT}\n\nCourtier: {broker_name}\n\n---\n{text}\n---\n\nJSON uniquement:"}],
            "max_tokens": 2000, "temperature": 0.1
        }, timeout=30)
        if resp.status_code != 200:
            print(f"   ❌ Groq {resp.status_code}"); return None
        content = resp.json()["choices"][0]["message"]["content"].strip()
        if content.startswith("```"): content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"): content = content[:-3]
        result = json.loads(content.strip())
        print(f"   ✅ Confiance: {result.get('confiance', '?')}")
        return result
    except Exception as e:
        print(f"   ❌ Groq error: {e}"); return None


def map_to_supabase(extracted):
    """Convertit le JSON Groq vers les colonnes Supabase."""
    if not extracted: return {}
    update = {}
    # Frais de courtage → JSONB fees
    fees = {}
    for market, key in [("france", "FR"), ("europe", "EU"), ("usa", "US")]:
        tiers = extracted.get("frais_courtage", {}).get(market)
        if tiers and isinstance(tiers, list) and len(tiers) > 0:
            fees[key] = [{"min": t.get("min_eur", 0), "max": t.get("max_eur"),
                          "type": t.get("type", "flat"), "amount": t.get("montant", 0)}
                         for t in tiers if isinstance(t, dict)]
    if fees: update["fees"] = fees
    # Champs simples
    for src, dst in [("droits_garde", "custody_fee"), ("frais_inactivite", "inactivity_fee"),
                     ("frais_change", "currency_fee"), ("depot_minimum", "deposit_minimum")]:
        val = extracted.get(src, {})
        if isinstance(val, dict) and val.get("montant") is not None:
            try: update[dst] = float(val["montant"])
            except: pass
    # Details
    for src, dst in [("droits_garde", "custody_fee_details"), ("frais_inactivite", "inactivity_fee_details"),
                     ("frais_change", "currency_fee_details")]:
        val = extracted.get(src, {})
        if isinstance(val, dict) and val.get("details"):
            update[dst] = val["details"]
        if isinstance(val, dict) and val.get("conditions"):
            update[dst] = val["conditions"]
    # Comptes
    comptes = extracted.get("comptes_disponibles")
    if comptes and isinstance(comptes, list) and len(comptes) > 0:
        update["accounts"] = comptes
    return update


def process_broker(broker, sb):
    """Traite un courtier complet : Google → PDF/Web → Groq → Supabase."""
    name = broker["name"]
    slug = broker["slug"]
    print(f"\n{'='*55}")
    print(f"  📊 {name}")
    print(f"{'='*55}")

    # 1. Google search
    urls = google_search(f"{name} tarifs frais courtage PDF site officiel")
    
    content = None
    source = None

    # 2. Try PDFs first
    for url in urls:
        if url.lower().endswith(".pdf"):
            content = extract_pdf(url)
            if content:
                source = f"PDF: {url}"
                break

    # 3. Try pricing_url or website
    if not content:
        pricing_url = broker.get("pricing_url") or broker.get("website")
        if pricing_url:
            if not pricing_url.startswith("http"): pricing_url = "https://" + pricing_url
            content = scrape_web(pricing_url)
            if content: source = f"Web: {pricing_url}"

    # 4. Try Google result pages
    if not content:
        for url in urls[:3]:
            if not url.lower().endswith(".pdf"):
                content = scrape_web(url)
                if content:
                    source = f"Web (Google): {url}"
                    break

    # 5. No content found
    if not content:
        print(f"   ❌ Aucun contenu trouvable pour {name}")
        try:
            sb.table("scrape_logs").insert({
                "broker_slug": slug, "status": "no_content", "fields_found": 0
            }).execute()
        except: pass
        return {"slug": slug, "name": name, "status": "no_content", "source": None}

    print(f"   📄 Source: {source}")

    # 6. Groq extraction
    extracted = ask_groq(content, name)
    if not extracted:
        try:
            sb.table("scrape_logs").insert({
                "broker_slug": slug, "status": "groq_failed", "fields_found": 0
            }).execute()
        except: pass
        return {"slug": slug, "name": name, "status": "groq_failed", "source": source}

    # 7. Map to Supabase
    update = map_to_supabase(extracted)
    fields = len(update)

    if update:
        update["updated_at"] = datetime.now().isoformat()
        try:
            sb.table("brokers").update(update).eq("slug", slug).execute()
            print(f"   ✅ {fields} champs mis à jour dans Supabase")
        except Exception as e:
            print(f"   ❌ Supabase update failed: {e}")

    # 8. Log
    try:
        sb.table("scrape_logs").insert({
            "broker_slug": slug, "status": "success",
            "fields_found": fields,
            "fees_extracted": {k: v for k, v in extracted.items() if k != "notes"},
        }).execute()
    except: pass

    return {
        "slug": slug, "name": name, "status": "success",
        "source": source, "fields": fields,
        "confiance": extracted.get("confiance"),
        "extracted": extracted
    }


def main():
    print("=" * 55)
    print("  ArbitrAge — Scraper v3.0")
    print("  Google + PDF + Web + Groq → Supabase")
    print(f"  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print("=" * 55)

    if not GROQ_KEY:
        print("\n❌ GROQ_KEY manquante")
        print('   GROQ_KEY="gsk_..." SUPABASE_KEY="eyJ..." python3 scripts/scraper/scrape_v3.py')
        sys.exit(1)

    sb = get_supabase()

    # Get brokers from Supabase
    print("\n📋 Récupération des partenaires...")
    resp = sb.table("brokers").select("slug, name, website, pricing_url").order("name").execute()
    brokers = resp.data
    print(f"   {len(brokers)} partenaires")

    results = []
    for broker in brokers:
        result = process_broker(broker, sb)
        results.append(result)
        time.sleep(3)  # Be nice to Google

    # Summary
    success = sum(1 for r in results if r["status"] == "success")
    no_content = sum(1 for r in results if r["status"] == "no_content")
    failed = sum(1 for r in results if r["status"] == "groq_failed")

    print(f"\n{'='*55}")
    print(f"  RÉSUMÉ")
    print(f"{'='*55}")
    for r in results:
        icon = "✅" if r["status"] == "success" else "⚠️" if r["status"] == "no_content" else "❌"
        fields = r.get("fields", 0)
        conf = r.get("confiance", "—")
        src = (r.get("source") or "—")[:50]
        print(f"  {icon} {r['name']:25s} {fields} champs  [{conf}]  {src}")

    print(f"\n  ✅ Réussi: {success}/{len(results)}")
    print(f"  ⚠️ Sans contenu: {no_content}")
    print(f"  ❌ Échoué: {failed}")

    # Les courtiers "no_content" doivent être traités manuellement dans l'admin
    if no_content > 0:
        print(f"\n  📝 {no_content} courtier(s) nécessitent une saisie manuelle dans l'admin.")
        print(f"     → /dashboard/admin/scraping")

    with open("scrape_v3_results.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    print(f"\n  💾 Détails: scrape_v3_results.json")


if __name__ == "__main__":
    main()
