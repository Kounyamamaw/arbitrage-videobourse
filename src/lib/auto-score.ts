import { Broker } from "./brokers";

/**
 * Auto-calculate broker scores based on real data.
 * Returns updated score fields. Scores are 0-10.
 */
export function calculateAutoScores(broker: Broker, allBrokers: Broker[]): {
  score_fees: number;
  score_reliability: number;
  score_ux: number;
  score_overall: number;
} {
  const cat = broker.category;
  const fees = (broker.fees || {}) as any;

  // ── Score Frais (0-10) ──
  let scoreFees = 5; // default middle

  if (cat === "broker" || cat === "bank") {
    // Compare FR first-tier fee vs all brokers
    const frFee = fees?.FR?.[0]?.amount;
    if (frFee !== undefined && frFee !== null) {
      const allFrFees = allBrokers
        .filter(b => (b.category === "broker" || b.category === "bank") && b.fees?.FR?.[0]?.amount != null)
        .map(b => b.fees.FR[0].amount);
      if (allFrFees.length > 1) {
        const max = Math.max(...allFrFees);
        const min = Math.min(...allFrFees);
        // Lower fees = higher score
        scoreFees = max === min ? 7 : Math.round(((max - frFee) / (max - min)) * 8 + 2);
      } else {
        scoreFees = frFee === 0 ? 9.5 : frFee <= 1 ? 8.5 : frFee <= 5 ? 7 : frFee <= 10 ? 5 : 3;
      }
    }
    // Penalize for custody fees
    if (broker.custody_fee > 0) scoreFees = Math.max(scoreFees - 1, 1);
    // Penalize for inactivity fees
    if (broker.inactivity_fee > 0) scoreFees = Math.max(scoreFees - 0.5, 1);
    // Bonus for no change fees
    if (broker.currency_fee === 0) scoreFees = Math.min(scoreFees + 0.5, 10);
  }

  if (cat === "crypto") {
    const maker = fees?.maker?.montant ?? fees?.trading_spot?.montant;
    if (maker != null) {
      // Crypto: lower maker fee = better
      scoreFees = maker === 0 ? 10 : maker <= 0.1 ? 9 : maker <= 0.25 ? 8 : maker <= 0.5 ? 7 : maker <= 1 ? 5.5 : 4;
    }
  }

  if (cat === "cfd") {
    const spread = fees?.spread_indices?.montant ?? fees?.spread_forex?.montant;
    if (spread != null) {
      scoreFees = spread <= 0.5 ? 9 : spread <= 1 ? 8 : spread <= 2 ? 7 : spread <= 5 ? 5 : 3;
    }
  }

  if (cat === "insurance") {
    const gestionUC = fees?.gestion_uc?.montant;
    if (gestionUC != null) {
      scoreFees = gestionUC <= 0.5 ? 9.5 : gestionUC <= 0.6 ? 8.5 : gestionUC <= 0.75 ? 7 : gestionUC <= 1 ? 5.5 : 4;
    }
  }

  // ── Score Fiabilité (0-10) ──
  let scoreReliability = 5;

  // Regulation bonus
  const regCount = broker.regulation?.length || 0;
  const hasTopReg = broker.regulation?.some(r =>
    ["AMF", "FCA", "BaFin", "SEC", "FINMA", "ACPR", "CySEC", "Banque centrale d'Irlande"].includes(r)
  );
  scoreReliability = regCount === 0 ? 3 : regCount === 1 ? 6 : regCount >= 2 ? 7.5 : 5;
  if (hasTopReg) scoreReliability += 1;

  // Trustpilot bonus
  if (broker.trustpilot_score > 0) {
    // Trustpilot 4.5+ = +2, 4.0+ = +1.5, 3.5+ = +1, 3.0+ = +0.5, below = -0.5
    if (broker.trustpilot_score >= 4.5) scoreReliability += 2;
    else if (broker.trustpilot_score >= 4.0) scoreReliability += 1.5;
    else if (broker.trustpilot_score >= 3.5) scoreReliability += 1;
    else if (broker.trustpilot_score >= 3.0) scoreReliability += 0.5;
    else scoreReliability -= 0.5;

    // Review count matters — more reviews = more trustworthy
    if (broker.trustpilot_count > 5000) scoreReliability += 0.5;
    else if (broker.trustpilot_count > 1000) scoreReliability += 0.25;
  }

  // Founding year bonus (older = more reliable)
  if (broker.founded) {
    const age = 2026 - broker.founded;
    if (age >= 20) scoreReliability += 1;
    else if (age >= 10) scoreReliability += 0.5;
    else if (age < 3) scoreReliability -= 0.5;
  }

  scoreReliability = Math.min(Math.max(scoreReliability, 1), 10);

  // ── Score UX (0-10) ──
  // Based on Trustpilot (user experience proxy) + app availability
  let scoreUX = 5;
  if (broker.trustpilot_score > 0) {
    // Direct mapping: TP 5.0 = UX 9, TP 4.0 = UX 7, TP 3.0 = UX 5, TP 2.0 = UX 3
    scoreUX = Math.round((broker.trustpilot_score / 5) * 8 + 1);
  }
  // Bonus for many account types (more features = better UX generally)
  if (broker.accounts?.length >= 3) scoreUX += 0.5;

  scoreUX = Math.min(Math.max(scoreUX, 1), 10);

  // ── Score Overall — moyenne simple des critères renseignés ──
  const scoreEnvergure = (broker as any).score_envergure ?? 0;
  const scoreSupport   = (broker as any).score_support   ?? 0;

  const allScores = [scoreFees, scoreReliability, scoreUX, scoreEnvergure, scoreSupport].filter(s => s > 0);
  const scoreOverall = allScores.reduce((a, b) => a + b, 0) / allScores.length;

  return {
    score_fees: Math.round(scoreFees * 10) / 10,
    score_reliability: Math.round(scoreReliability * 10) / 10,
    score_ux: Math.round(scoreUX * 10) / 10,
    score_overall: Math.min(Math.round(scoreOverall * 10) / 10, 10),
  };
}
