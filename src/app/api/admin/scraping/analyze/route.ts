import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

const GROQ_KEY = process.env.GROQ_API_KEY || "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Category-specific extraction prompts
const PROMPTS: Record<string, string> = {
  broker: `Tu es un extracteur de données pour un COURTIER EN BOURSE.
Extrais UNIQUEMENT ce qui est EXPLICITEMENT dans le texte. N'invente RIEN.

Retourne ce JSON EXACT :
{
  "courtier": "nom",
  "categorie_detectee": "broker",
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
  "marches_disponibles": [],
  "trustpilot_score": null,
  "trustpilot_count": null,
  "offre_bienvenue": null,
  "pros": [],
  "cons": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui manque"
}`,

  crypto: `Tu es un extracteur de données pour un EXCHANGE CRYPTO.
Extrais UNIQUEMENT ce qui est EXPLICITEMENT dans le texte. N'invente RIEN.

Retourne ce JSON EXACT :
{
  "courtier": "nom",
  "categorie_detectee": "crypto",
  "frais_trading_spot": {"montant": null, "unite": "%", "details": null},
  "frais_maker": {"montant": null, "unite": "%"},
  "frais_taker": {"montant": null, "unite": "%"},
  "spread_moyen": {"montant": null, "unite": "%", "details": null},
  "frais_depot_carte": {"montant": null, "unite": "%", "details": null},
  "frais_depot_virement": {"montant": null, "unite": "EUR"},
  "frais_retrait_crypto": {"details": null},
  "frais_retrait_fiat": {"montant": null, "unite": "EUR", "details": null},
  "frais_staking": {"montant": null, "unite": "%", "details": null},
  "frais_inactivite": {"montant": null, "unite": "EUR", "conditions": null},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "nb_cryptos_disponibles": null,
  "regulation": [],
  "trustpilot_score": null,
  "trustpilot_count": null,
  "pros": [],
  "cons": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui manque"
}`,

  cfd: `Tu es un extracteur de données pour un COURTIER CFD/FOREX.
Extrais UNIQUEMENT ce qui est EXPLICITEMENT dans le texte. N'invente RIEN.

Retourne ce JSON EXACT :
{
  "courtier": "nom",
  "categorie_detectee": "cfd",
  "spread_indices": {"montant": null, "unite": "points", "details": null},
  "spread_forex": {"montant": null, "unite": "pips", "details": null},
  "spread_actions": {"montant": null, "unite": "%", "details": null},
  "frais_overnight": {"montant": null, "unite": "%", "details": null},
  "frais_inactivite": {"montant": null, "unite": "EUR", "conditions": null},
  "frais_retrait": {"montant": null, "unite": "EUR"},
  "frais_change": {"montant": null, "unite": "%"},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "levier_max": null,
  "protection_solde_negatif": null,
  "regulation": [],
  "trustpilot_score": null,
  "trustpilot_count": null,
  "pros": [],
  "cons": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui manque"
}`,

  insurance: `Tu es un extracteur de données pour une ASSURANCE-VIE / ÉPARGNE.
Extrais UNIQUEMENT ce qui est EXPLICITEMENT dans le texte. N'invente RIEN.

Retourne ce JSON EXACT :
{
  "courtier": "nom",
  "categorie_detectee": "insurance",
  "frais_gestion_uc": {"montant": null, "unite": "%", "details": null},
  "frais_gestion_fonds_euro": {"montant": null, "unite": "%"},
  "frais_entree": {"montant": null, "unite": "%"},
  "frais_arbitrage": {"montant": null, "unite": "EUR", "details": null},
  "frais_sortie": {"montant": null, "unite": "%", "conditions": null},
  "rendement_fonds_euro": {"montant": null, "unite": "%", "annee": null},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "nb_supports_uc": null,
  "enveloppes": [],
  "trustpilot_score": null,
  "trustpilot_count": null,
  "pros": [],
  "cons": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui manque"
}`,

  bank: `Tu es un extracteur de données pour une BANQUE proposant des services de bourse.
Extrais UNIQUEMENT ce qui est EXPLICITEMENT dans le texte. N'invente RIEN.

Retourne ce JSON EXACT :
{
  "courtier": "nom",
  "categorie_detectee": "bank",
  "frais_courtage": {
    "france": [{"min_eur": 0, "max_eur": null, "montant": null, "unite": "EUR", "type": "flat"}],
    "europe": [],
    "usa": []
  },
  "frais_tenue_compte": {"montant": null, "unite": "EUR", "details": null},
  "droits_garde": {"montant": null, "unite": "EUR", "details": null},
  "frais_change": {"montant": null, "unite": "%"},
  "depot_minimum": {"montant": null, "unite": "EUR"},
  "comptes_disponibles": [],
  "carte_bancaire_incluse": null,
  "trustpilot_score": null,
  "trustpilot_count": null,
  "pros": [],
  "cons": [],
  "confiance": "haute/moyenne/basse",
  "notes": "ce qui manque"
}`,
};

const AUTO_DETECT_PROMPT = `Analyse ce texte et détermine la catégorie du service financier décrit.
Réponds par UN SEUL MOT parmi : broker, crypto, cfd, insurance, bank, scpi
Texte : `;

export async function POST(req: NextRequest) {
  if (!GROQ_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY non configurée sur le serveur" }, { status: 500 });
  }

  const { broker_slug, text, category } = await req.json();
  if (!broker_slug || !text || text.trim().length < 30) {
    return NextResponse.json({ error: "Texte trop court (minimum 30 caractères)" }, { status: 400 });
  }

  // Get broker category from Supabase if not provided
  let cat = category;
  if (!cat) {
    const { data } = await supabase.from("brokers").select("category").eq("slug", broker_slug).single();
    cat = data?.category || "broker";
  }

  // Auto-detect category from text if generic
  if (!cat || cat === "broker") {
    try {
      const detectResp = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: AUTO_DETECT_PROMPT + text.slice(0, 2000) }],
          max_tokens: 10, temperature: 0.1,
        }),
      });
      if (detectResp.ok) {
        const detectData = await detectResp.json();
        const detected = detectData.choices?.[0]?.message?.content?.trim().toLowerCase();
        if (detected && PROMPTS[detected]) {
          cat = detected;
        }
      }
    } catch { /* keep original category */ }
  }

  const prompt = PROMPTS[cat] || PROMPTS.broker;
  const truncated = text.slice(0, 14000);

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: `${prompt}\n\nCourtier: ${broker_slug}\n\n---\n${truncated}\n---\n\nJSON uniquement, sans markdown, sans backticks:` }],
        max_tokens: 2500, temperature: 0.1,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Groq API error: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content?.trim() || "";
    if (content.startsWith("```")) content = content.split("\n").slice(1).join("\n");
    if (content.endsWith("```")) content = content.slice(0, -3);

    const parsed = JSON.parse(content.trim());

    // Add metadata
    parsed._category = cat;
    parsed._broker_slug = broker_slug;

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: `Erreur d'analyse: ${String(e)}` }, { status: 500 });
  }
}
