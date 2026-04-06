import { supabase } from "./supabase";

const DEFAULTS: Record<string, string> = {
  hero_title: "Le vrai coût de vos investissements. En clair.",
  hero_subtitle: "ArbitrAge calcule le coût total réel de chaque courtier, chaque ETF, chaque enveloppe. Pas de marketing, pas de classements sponsorisés : les données brutes, pour vous.",
  hero_badge: "Comparateur 100% indépendant",
  cta_title: "Trouvez le courtier qui vous coûte le moins.",
  cta_subtitle: "C'est gratuit, indépendant, et ça prend 2 minutes.",
  footer_text: "Outil indépendant édité par VideoBourse. Lien d'affiliation.",
  stat_1_value: "12+",
  stat_1_label: "Courtiers analysés",
  stat_2_value: "100",
  stat_2_label: "ETF référencés",
  stat_3_value: "40K+",
  stat_3_label: "Investisseurs VB",
  stat_4_value: "100%",
  stat_4_label: "Indépendant",
  testimonial_1_name: "Thomas R.",
  testimonial_1_role: "Investisseur particulier",
  testimonial_1_text: "ArbitrAge m'a montré que je payais 180€ de frais de plus par an qu'ailleurs. J'ai changé en 48h.",
  testimonial_2_name: "Marie L.",
  testimonial_2_role: "Investisseuse active PEA",
  testimonial_2_text: "Enfin un outil qui calcule le coût total réel sur mon profil exact. C'est ça qui manquait.",
  testimonial_3_name: "Karim B.",
  testimonial_3_role: "Investisseur passif",
  testimonial_3_text: "La réponse du Conseiller IA était plus précise que tout ce que je trouvais sur les forums.",
};

export async function getContent(): Promise<Record<string, string>> {
  try {
    if (!supabase) return DEFAULTS;
    const { data } = await supabase.from("site_content").select("key, value");
    if (!data || data.length === 0) return DEFAULTS;
    const merged = { ...DEFAULTS };
    for (const row of data) {
      if (row.value) merged[row.key] = row.value;
    }
    return merged;
  } catch {
    return DEFAULTS;
  }
}
