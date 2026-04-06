-- Add metrics and testimonials content keys
-- Execute in Supabase SQL Editor

INSERT INTO site_content (key, value, description) VALUES
  ('stat_1_value', '12+', 'Métrique 1 — valeur'),
  ('stat_1_label', 'Courtiers analysés', 'Métrique 1 — label'),
  ('stat_2_value', '100', 'Métrique 2 — valeur'),
  ('stat_2_label', 'ETF référencés', 'Métrique 2 — label'),
  ('stat_3_value', '40K+', 'Métrique 3 — valeur'),
  ('stat_3_label', 'Investisseurs VB', 'Métrique 3 — label'),
  ('stat_4_value', '100%', 'Métrique 4 — valeur'),
  ('stat_4_label', 'Indépendant', 'Métrique 4 — label'),
  ('testimonial_1_name', 'Thomas R.', 'Témoignage 1 — nom'),
  ('testimonial_1_role', 'Investisseur particulier', 'Témoignage 1 — rôle'),
  ('testimonial_1_text', 'ArbitrAge m''a montré que je payais 180€ de frais de plus par an qu''ailleurs. J''ai changé en 48h.', 'Témoignage 1 — texte'),
  ('testimonial_2_name', 'Marie L.', 'Témoignage 2 — nom'),
  ('testimonial_2_role', 'Investisseuse active PEA', 'Témoignage 2 — rôle'),
  ('testimonial_2_text', 'Enfin un outil qui calcule le coût total réel sur mon profil exact.', 'Témoignage 2 — texte'),
  ('testimonial_3_name', 'Karim B.', 'Témoignage 3 — nom'),
  ('testimonial_3_role', 'Investisseur passif', 'Témoignage 3 — rôle'),
  ('testimonial_3_text', 'La réponse du Conseiller IA était plus précise que tout ce que je trouvais sur les forums.', 'Témoignage 3 — texte')
ON CONFLICT (key) DO NOTHING;
