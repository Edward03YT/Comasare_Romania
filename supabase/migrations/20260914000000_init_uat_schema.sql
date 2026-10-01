-- Extensie spatiala PostGIS
create extension if not exists postgis;

-- 1. Tabela UAT: contine datele demografice, financiare si geometria spatiala
create table if not exists uat (
  siruta_cod integer primary key,
  nume text not null,
  judet text not null,
  tip text,               -- municipiu / oras / comuna
  populatie integer default 0,
  geom geometry(MultiPolygon, 4326),
  cheltuieli_functionare numeric default 0,
  cheltuieli_dezvoltare numeric default 0,
  venituri_proprii numeric default 0,
  venituri_totale numeric default 0
);

create index if not exists idx_uat_geom on uat using gist(geom);
create index if not exists idx_uat_judet on uat(judet);
create index if not exists idx_uat_populatie on uat(populatie);

-- 2. Tabela uat_adiacenta: graful de granita partajata (cine e vecin cu cine)
create table if not exists uat_adiacenta (
  uat_a integer references uat(siruta_cod) on delete cascade,
  uat_b integer references uat(siruta_cod) on delete cascade,
  primary key (uat_a, uat_b)
);

create index if not exists idx_uat_adiacenta_b on uat_adiacenta(uat_b);

-- 3. Tabela scenariu: set de grupari de comasare (manual sau automat)
create table if not exists scenariu (
  id uuid primary key default gen_random_uuid(),
  nume text not null,
  prag_populatie integer not null default 3000,
  creat_la timestamptz default now()
);

-- 4. Tabela grup_fuzionare: entitate creata prin comasare
create table if not exists grup_fuzionare (
  id uuid primary key default gen_random_uuid(),
  scenariu_id uuid references scenariu(id) on delete cascade,
  uat_principal integer references uat(siruta_cod) on delete cascade
);

-- 5. Tabela grup_membru: UAT-urile membre ale fiecarui grup
create table if not exists grup_membru (
  grup_id uuid references grup_fuzionare(id) on delete cascade,
  uat_cod integer references uat(siruta_cod) on delete cascade,
  primary key (grup_id, uat_cod)
);
