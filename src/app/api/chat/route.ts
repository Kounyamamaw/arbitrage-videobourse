import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

// Plus besoin de buildAffiliateIndex — makeBrokersClickable côté client gère tous les liens

function buildSystemPrompt(
  brokers: unknown[],
  etfs: unknown[]
) {
  const etfData =
    etfs.length > 0
      ? `\nETF DISPONIBLES SUR LA PLATEFORME :\n${JSON.stringify(etfs, null, 0)}`
      : "";

  return `Tu es un conseiller financier indépendant, pédagogue et expert en investissement pour les particuliers français. Tu es intégré dans ArbitrAge, un comparateur de courtiers et ETF par VideoBourse.

TA MISSION PRINCIPALE : être utile, informatif et pédagogue. L'information et la pédagogie passent AVANT tout référencement de courtiers.

DONNÉES COURTIERS DISPONIBLES (contexte uniquement) :
${JSON.stringify(brokers, null, 0)}
${etfData}

═══ RÈGLES DE RÉPONSE ═══

1. PÉDAGOGIE D'ABORD
   - Réponds d'abord à la question avec des faits concrets, des chiffres, des explications claires
   - Si on demande "quel ETF S&P 500 éligible PEA ?", commence par NOMMER les ETF (CSPX, SPVE, SP5C, SPYL...), leur TER, leur émetteur (iShares, Amundi, SPDR...) — pas par parler de courtiers
   - Si on demande "PEA ou CTO ?", explique la fiscalité des deux avant de mentionner des courtiers
   - L'utilisateur veut d'abord comprendre, ensuite choisir

2. COURTIERS : PARCIMONIE TOTALE
   - Mentionne 1 ou 2 courtiers MAX, uniquement si la question porte directement sur le choix d'un courtier
   - Si la question porte sur un ETF, une enveloppe fiscale, une stratégie : NE MENTIONNE PAS de courtier, ou une brève mention en fin de réponse ("disponible sur la plupart des courtiers comme XTB ou Trade Republic")
   - N'impose JAMAIS un lien cliquable si ce n'est pas pertinent

3. NOMS DE COURTIERS — RÈGLES ABSOLUES
   INTERDIT absolu : écrire quoi que ce soit entre crochets et parenthèses comme [texte](url)
   INTERDIT absolu : écrire toute URL, chemin ou slug (/go/..., /dashboard/..., https://...)
   INTERDIT absolu : mentionner le même courtier deux fois dans la même réponse
   
   Pour citer un courtier : écris UNIQUEMENT son nom en texte simple, sans aucun formatage lien.
   Exemple correct : "Interactive Brokers est une bonne option pour les investisseurs expérimentés."
   Exemple INTERDIT : "[Interactive Brokers](/go/interactive-brokers)" ou "Interactive Brokers/go/..."
   
   La plateforme gère automatiquement les liens — tu n'as rien à faire côté liens.
   Maximum 2 courtiers différents mentionnés par réponse, chacun cité UNE SEULE FOIS.

4. FORMAT
   - Français naturel, max 220 mots
   - Gras uniquement pour les chiffres clés (TER, frais)
   - Listes uniquement pour comparer plusieurs ETF ou plusieurs options
   - Ton : expert bienveillant qui explique à un ami, pas un commercial

5. EXEMPLES DE BONNE RÉPONSE
   Question "ETF S&P 500 éligible PEA le moins cher ?" → réponse attendue :
   Commence par : "Les ETF S&P 500 éligibles PEA les plus populaires sont..."
   Cite : Amundi S&P 500 UCITS (ticker : SP5C, TER : 0,15%), iShares Core S&P 500 UCITS (CSPX non PEA mais SPYL si PEA), SPDR S&P 500...
   Explique la différence de réplication (physique vs synthétique pour le PEA)
   Fin possible : "Ces ETF sont disponibles chez la plupart des courtiers avec PEA."
   
   Ce que tu NE fais PAS : parler de XTB ou Trade Republic comme réponse à une question ETF.`;
}

function filterContext(
  question: string,
  brokers: Record<string, unknown>[],
  etfs: Record<string, unknown>[]
) {
  const q = question.toLowerCase();

  const isAboutBroker =
    q.includes("courtier") ||
    q.includes("broker") ||
    q.includes("ouvrir") ||
    q.includes("choisir") ||
    q.includes("meilleur courtier") ||
    q.includes("chez quel");
  const isAboutETF =
    q.includes("etf") ||
    q.includes("fond") ||
    q.includes("ter") ||
    q.includes("tracker") ||
    q.includes("msci") ||
    q.includes("sp500") ||
    q.includes("s&p") ||
    q.includes("world") ||
    q.includes("nasdaq") ||
    q.includes("cac");
  const isAboutFiscality =
    q.includes("pea") ||
    q.includes("cto") ||
    q.includes("av") ||
    q.includes("assurance") ||
    q.includes("per") ||
    q.includes("fiscal") ||
    q.includes("impôt");

  let filtered = brokers.filter((b) => {
    const name = ((b.name as string) || "").toLowerCase();
    const slug = ((b.slug as string) || "").toLowerCase();
    if (q.includes(name) || q.includes(slug)) return true;
    if (q.includes("pea")) return (b.accounts as string[])?.includes("PEA");
    if (q.includes("cto")) return (b.accounts as string[])?.includes("CTO");
    if (q.includes("dca") || q.includes("mensuel") || q.includes("automatique"))
      return !!(b as any).has_dca;
    if (q.includes("crypto")) return b.category === "crypto";
    if (
      q.includes("débutant") ||
      q.includes("commencer") ||
      q.includes("débuter")
    )
      return (b as any).level === "debutant";
    if (
      q.includes("expert") ||
      q.includes("professionnel") ||
      q.includes("avancé")
    )
      return (b as any).level === "expert";
    if (q.includes("fractions")) return !!(b as any).has_fractions;
    if (isAboutBroker) return Number(b.score_overall) > 7;
    return false;
  });

  if (!isAboutBroker && (isAboutETF || isAboutFiscality)) {
    filtered = [...brokers]
      .filter(
        (b) =>
          Number(b.score_overall) > 8 &&
          (b.accounts as string[])?.includes("PEA")
      )
      .sort((a, z) => Number(z.score_overall) - Number(a.score_overall))
      .slice(0, 3);
  }

  if (filtered.length === 0) {
    filtered = [...brokers]
      .filter((b) => Number(b.score_overall) > 0)
      .sort((a, z) => Number(z.score_overall) - Number(a.score_overall))
      .slice(0, 5);
  }

  const relevantBrokers = filtered.slice(0, 5).map((b) => ({
    name: b.name,
    slug: b.slug,
    score: b.score_overall,
    score_fees: b.score_fees,
    score_envergure: (b as any).score_envergure ?? 0,
    score_support: (b as any).score_support ?? 0,
    fees_fr: (b.fees as Record<string, unknown>)?.FR,
    accounts: b.accounts,
    category: b.category,
    level: (b as any).level,
    has_dca: (b as any).has_dca,
    has_fractions: (b as any).has_fractions,
    pros: (b.pros as string[])?.slice(0, 2),
  }));

  const relevantETFs = etfs
    .filter((e) => {
      const ticker = ((e.ticker as string) || "").toLowerCase();
      const name = ((e.name as string) || "").toLowerCase();
      if (q.includes(ticker) || q.includes(name)) return true;
      if (q.includes("sp500") || q.includes("s&p"))
        return e.index_slug === "sp500";
      if (q.includes("world") || q.includes("msci"))
        return e.index_slug === "msci-world";
      if (q.includes("nasdaq"))
        return ((e.index_slug as string) || "").includes("nasdaq");
      if (q.includes("pea")) return e.pea_eligible;
      if (q.includes("oblig"))
        return ((e.index_slug as string) || "").includes("bond");
      return q.includes("etf") || q.includes("fond") || q.includes("ter");
    })
    .slice(0, 8)
    .map((e) => ({
      ticker: e.ticker,
      name: e.name,
      ter: e.ter,
      pea: e.pea_eligible,
      issuer: e.issuer,
      index_slug: e.index_slug,
    }));

  return { brokers: relevantBrokers, etfs: relevantETFs };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
      return NextResponse.json(
        { error: "GROQ_API_KEY non configurée" },
        { status: 500 }
      );
    if (!apiKey.startsWith("gsk_")) {
      console.error("GROQ_API_KEY invalide — doit commencer par gsk_");
      return NextResponse.json(
        { error: "GROQ_API_KEY invalide (doit commencer par gsk_)" },
        { status: 500 }
      );
    }

    let brokers: Record<string, unknown>[] = [];
    let etfs: Record<string, unknown>[] = [];

    if (supabase) {
      const { data: b } = await supabase.from("brokers").select("*");
      const { data: e } = await supabase
        .from("etfs")
        .select("ticker,name,ter,pea_eligible,issuer,index_slug");
      if (b) brokers = b;
      if (e) etfs = e;
    }
    if (brokers.length === 0) {
      const mod = await import("@/data/brokers.json");
      brokers = mod.default as unknown as Record<string, unknown>[];
    }
    if (etfs.length === 0) {
      const mod = await import("@/data/etfs.json");
      etfs = mod.default as unknown as Record<string, unknown>[];
    }

    const lastQuestion = messages[messages.length - 1]?.content || "";
    const context = filterContext(lastQuestion, brokers, etfs);
    const systemPrompt = buildSystemPrompt(
      context.brokers,
      context.etfs
    );

    const response = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-6),
        ],
        max_tokens: 600,
        temperature: 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Groq error: ${err}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      "Désolé, je n'ai pas pu générer de réponse.";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}