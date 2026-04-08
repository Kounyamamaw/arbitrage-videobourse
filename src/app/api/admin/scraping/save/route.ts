import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { broker_slug, extracted } = await req.json();
  if (!broker_slug || !extracted) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // 1. Fetch existing broker data
  const { data: existing } = await supabase.from("brokers").select("*").eq("slug", broker_slug).single();
  if (!existing) {
    return NextResponse.json({ error: "Courtier non trouvé" }, { status: 404 });
  }

  const category = extracted._category || extracted.categorie_detectee || existing.category || "broker";
  const update: Record<string, any> = {};

  // Helper: only update if new value is non-null AND (field is empty OR different)
  const mergeField = (key: string, newVal: any) => {
    if (newVal === null || newVal === undefined) return;
    const oldVal = existing[key];
    // If old value is empty/zero/null, always take new
    if (oldVal === null || oldVal === undefined || oldVal === 0 || oldVal === "") {
      update[key] = newVal;
      return;
    }
    // If old value exists and new is different, take new (latest data wins)
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      update[key] = newVal;
    }
  };

  const mergeObject = (key: string, newObj: any) => {
    if (!newObj || typeof newObj !== "object") return;
    if (newObj.montant === null && newObj.details === null && newObj.conditions === null) return;
    if (newObj.montant !== null && newObj.montant !== undefined) {
      mergeField(key, Number(newObj.montant));
    }
    const detailKey = key + "_details";
    const detail = newObj.details || newObj.conditions;
    if (detail) mergeField(detailKey, String(detail));
  };

  // ── Common fields ──
  mergeObject("deposit_minimum", extracted.depot_minimum);
  mergeObject("inactivity_fee", extracted.frais_inactivite);
  mergeObject("withdrawal_fee", extracted.frais_retrait);
  
  if (extracted.trustpilot_score != null) mergeField("trustpilot_score", Number(extracted.trustpilot_score));
  if (extracted.trustpilot_count != null) mergeField("trustpilot_count", Number(extracted.trustpilot_count));
  if (extracted.offre_bienvenue) mergeField("welcome_offer", extracted.offre_bienvenue);

  // Merge arrays (pros, cons, accounts, regulation, markets) — combine without duplicates
  const mergeArray = (key: string, newArr: any[]) => {
    if (!newArr || !Array.isArray(newArr) || newArr.length === 0) return;
    const oldArr = existing[key] || [];
    const combined = Array.from(new Set([...oldArr, ...newArr]));
    if (combined.length > oldArr.length) {
      update[key] = combined;
    }
  };
  mergeArray("pros", extracted.pros);
  mergeArray("cons", extracted.cons);
  mergeArray("accounts", extracted.comptes_disponibles || extracted.enveloppes);
  mergeArray("regulation", extracted.regulation);
  mergeArray("markets_available", extracted.marches_disponibles);

  // Update category if auto-detected
  if (extracted.categorie_detectee && extracted.categorie_detectee !== "broker" && existing.category === "broker") {
    update.category = extracted.categorie_detectee;
  }

  // ── Broker/Bank fees ──
  if (category === "broker" || category === "bank") {
    const newFees: Record<string, any[]> = {};
    for (const [market, key] of [["france", "FR"], ["europe", "EU"], ["usa", "US"]]) {
      const tiers = extracted.frais_courtage?.[market];
      if (tiers && Array.isArray(tiers) && tiers.length > 0 && tiers[0]?.montant != null) {
        newFees[key] = tiers.map((t: any) => ({
          min: t.min_eur ?? 0, max: t.max_eur ?? null,
          type: t.type ?? "flat", amount: t.montant ?? 0,
        }));
      }
    }
    if (Object.keys(newFees).length > 0) {
      // Merge with existing fees
      const oldFees = existing.fees || {};
      update.fees = { ...oldFees, ...newFees };
    }
    mergeObject("custody_fee", extracted.droits_garde);
    mergeObject("currency_fee", extracted.frais_change);
  }

  // ── Crypto fees → merge into existing fees JSONB ──
  if (category === "crypto") {
    const oldFees = existing.fees || {};
    const newFees: Record<string, any> = { ...oldFees };
    if (extracted.frais_trading_spot?.montant != null) newFees.trading_spot = extracted.frais_trading_spot;
    if (extracted.frais_maker?.montant != null) newFees.maker = extracted.frais_maker;
    if (extracted.frais_taker?.montant != null) newFees.taker = extracted.frais_taker;
    if (extracted.spread_moyen?.montant != null) newFees.spread = extracted.spread_moyen;
    if (extracted.frais_depot_carte?.montant != null) newFees.depot_carte = extracted.frais_depot_carte;
    if (extracted.frais_depot_virement?.montant != null) newFees.depot_virement = extracted.frais_depot_virement;
    if (extracted.frais_retrait_crypto?.details) newFees.retrait_crypto = extracted.frais_retrait_crypto;
    if (extracted.frais_retrait_fiat?.montant != null) newFees.retrait_fiat = extracted.frais_retrait_fiat;
    if (extracted.frais_staking?.montant != null) newFees.staking = extracted.frais_staking;
    if (extracted.nb_cryptos_disponibles) newFees.nb_cryptos = extracted.nb_cryptos_disponibles;
    if (JSON.stringify(newFees) !== JSON.stringify(oldFees)) {
      update.fees = newFees;
    }
  }

  // ── CFD fees ──
  if (category === "cfd") {
    const oldFees = existing.fees || {};
    const newFees: Record<string, any> = { ...oldFees };
    if (extracted.spread_indices?.montant != null) newFees.spread_indices = extracted.spread_indices;
    if (extracted.spread_forex?.montant != null) newFees.spread_forex = extracted.spread_forex;
    if (extracted.spread_actions?.montant != null) newFees.spread_actions = extracted.spread_actions;
    if (extracted.frais_overnight?.montant != null) newFees.overnight = extracted.frais_overnight;
    if (extracted.levier_max) newFees.levier_max = extracted.levier_max;
    if (extracted.protection_solde_negatif != null) newFees.protection_solde_negatif = extracted.protection_solde_negatif;
    mergeObject("currency_fee", extracted.frais_change);
    if (JSON.stringify(newFees) !== JSON.stringify(oldFees)) {
      update.fees = newFees;
    }
  }

  // ── Insurance fees ──
  if (category === "insurance") {
    const oldFees = existing.fees || {};
    const newFees: Record<string, any> = { ...oldFees };
    if (extracted.frais_gestion_uc?.montant != null) newFees.gestion_uc = extracted.frais_gestion_uc;
    if (extracted.frais_gestion_fonds_euro?.montant != null) newFees.gestion_fonds_euro = extracted.frais_gestion_fonds_euro;
    if (extracted.frais_entree?.montant != null) newFees.entree = extracted.frais_entree;
    if (extracted.frais_arbitrage?.montant != null) newFees.arbitrage = extracted.frais_arbitrage;
    if (extracted.frais_sortie?.montant != null) newFees.sortie = extracted.frais_sortie;
    if (extracted.rendement_fonds_euro?.montant != null) newFees.rendement_fonds_euro = extracted.rendement_fonds_euro;
    if (extracted.nb_supports_uc) newFees.nb_supports_uc = extracted.nb_supports_uc;
    if (JSON.stringify(newFees) !== JSON.stringify(oldFees)) {
      update.fees = newFees;
    }
  }

  // Only update if we have changes
  const fieldsCount = Object.keys(update).length;
  if (fieldsCount === 0) {
    return NextResponse.json({ message: "Aucune nouvelle donnée — tout est déjà à jour", fields_updated: 0 });
  }

  update.updated_at = new Date().toISOString();

  const { error } = await supabase.from("brokers").update(update).eq("slug", broker_slug);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log
  try {
    await supabase.from("scrape_logs").insert({
      broker_slug, status: "success", fields_found: fieldsCount,
      fees_extracted: extracted,
    });
  } catch { /* */ }

  return NextResponse.json({
    success: true,
    fields_updated: fieldsCount,
    category_used: category,
    updated_fields: Object.keys(update).filter(k => k !== "updated_at"),
  });
}
