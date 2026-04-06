-- Tables pour les classes d'actifs (Actions, Options, Futures, CFD, Forex)
create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  isin text,
  description text,
  available_at text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  isin text,
  description text,
  available_at text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists futures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  isin text,
  description text,
  available_at text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists cfds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  isin text,
  description text,
  available_at text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists forex (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  isin text,
  description text,
  available_at text[] default '{}',
  created_at timestamptz default now()
);

-- Colonnes supplémentaires pour les filtres avancés sur la table brokers
alter table brokers
  add column if not exists asset_classes text[] default '{}',
  add column if not exists level text default '',
  add column if not exists is_foreign boolean default false,
  add column if not exists provides_ifu boolean default false,
  add column if not exists platforms text[] default '{}',
  add column if not exists has_dca boolean default false,
  add column if not exists has_fractions boolean default false,
  add column if not exists logo_url text;
