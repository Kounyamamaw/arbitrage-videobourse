# VideoBourse — Comparateur de Courtiers

> Le comparateur de référence pour investisseurs français.
> Stack : Next.js 14 · Tailwind CSS · Supabase · TypeScript

---

## 🚀 Démarrage rapide (local Mac)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Pour l'instant tu peux laisser les valeurs Supabase vides,
l'app fonctionne avec les données JSON locales.

### 3. Lancer en développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
app/                    # Pages Next.js (App Router)
  page.tsx              # Homepage
  comparer/             # Wizard de comparaison
    resultats/          # Page résultats
  courtiers/            # Liste tous les courtiers
  etf/                  # Comparateur ETF (Phase 2)
  go/[slug]/            # Route affiliation trackée
  api/brokers/          # API REST brokers

components/
  layout/               # Header, Footer, ThemeInit
  brokers/              # BrokerCard, BrokerFilters, BrokerGrid
  compare/              # CompareWizard

lib/
  brokers.ts            # Types + fonctions calcul frais
  store.ts              # Zustand (thème, filtres, wizard)
  supabase.ts           # Client Supabase
  utils.ts              # cn()

data/
  brokers.json          # Données des 10 courtiers Phase 1
```

---

## 🗺️ Roadmap

- **Phase 1** (current) — 10 courtiers, wizard, filtres, dark mode ✅
- **Phase 2** — Simulateur frais annuels avancé, comparateur ETF
- **Phase 3** — 50+ entités (AV, crypto, SCPI, CFD), avis utilisateurs

---

## 📝 Ajouter un courtier

Éditer `data/brokers.json` en suivant la structure existante.
En Phase 3, la gestion passe par le panel admin Supabase.

---

## 🌙 Dark Mode

Toggle en haut à droite. Persisté en localStorage.
Utilise la classe `dark` sur `<html>` + CSS variables.

---

*VideoBourse — Stage comparateur 2025*
