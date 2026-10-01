# Harta Comasărilor Administrative — România

Instrument analitic și cadru tehnic de dezbatere publică pentru vizualizarea celor 3.186 de unități administrativ-teritoriale (UAT-uri) din România, analiza indicatorilor fiscali și demografici oficiali și simularea scenariilor de comasare administrativă bazate pe praguri de populație și grafuri de adiacență.

---

## Surse de date oficiale

Toate datele utilizate sunt publice, reale și descărcate direct de pe portalurile guvernamentale și academice:

| Set de date | Sursă oficială | Endpoint / Resursă | Format original | Data extragerii |
|---|---|---|---|---|
| **Nomenclator SIRUTA** | Institutul Național de Statistică / data.gov.ro | `https://data.gov.ro/dataset/721c9059-5f87-4c79-9854-a1d5c18f58d5/resource/dac903f0-32b5-489a-89e7-2c80d96cf68d/download/siruta_s1_2026.csv` | CSV (delimitat `;`) | 13 septembrie 2026 |
| **Granițe și Geometrii UAT** | ANCPI / geo-spatial.org | `https://services.geo-spatial.org/data/administrative_boundaries/lau/ro_admin_lau_simplified_polygon.zip` | Shapefile (EPSG:3844 re-proiectat WGS84) | 13 septembrie 2026 |
| **Graful de adiacență (vecinătate)** | ANCPI / geo-spatial.org (layer LINIE) | `https://services.geo-spatial.org/data/administrative_boundaries/lau/ro_admin_lau_simplified_line.zip` | DBF / Shapefile (atribute `leftId`, `rightId`) | 13 septembrie 2026 |
| **Execuție bugetară și Populație** | Ministerul Finanțelor (rapoarte COFOG3 / Forexe), ANAF și Recensământ INS 2021 | Agregat oficial per SIRUTA: venituri proprii, cheltuieli de funcționare, cheltuieli de dezvoltare, cheltuieli de personal | JSON structurat | 13 septembrie 2026 |
| **Rețea rutieră (Autostrăzi + Drumuri Naționale)** | OpenStreetMap / Geofabrik România | `https://download.geofabrik.de/europe/romania-latest-free.shp.zip` (layer `gis_osm_roads_free_1`, `fclass: motorway, trunk, primary`) | Shapefile WGS84 simplificat | 14 septembrie 2026 |

---

## Arhitectura aplicației

- **Framework**: Next.js 14 (App Router) + TypeScript + React 18
- **Motor cartografic**: React-Leaflet configurat cu Canvas Renderer (`preferCanvas: true`) peste tile-uri OpenStreetMap cu filtru tonal cadastral
- **Bază de date**: Supabase (PostgreSQL + extensia PostGIS activată)
- **Identitate vizuală**: „Instrument cadastral” (paletă strictă de 6 valori: Cerneală `#1B2430`, Hârtie `#EFEAE0`, Alertă `#B23A2E`, Sănătos `#4C6B4F`, Neutru `#8B8478`, Semnal `#C9A227`; fonturi tehnice IBM Plex Sans, IBM Plex Sans Condensed și IBM Plex Mono cu `tabular-nums`)

---

## Structura proiectului

```
Comasare_Romania/
├── app/
│   ├── layout.tsx             # Layout rădăcină (fonturi IBM Plex, stiluri globale)
│   ├── page.tsx               # Pagina principală (orchestrator hartă, panouri, comenzi)
│   ├── globals.css            # Tokeni de culoare și stiluri de instrument cadastral
│   └── api/
│       ├── uat/route.ts       # Endpoint GeoJSON UAT
│       └── adiacenta/route.ts # Endpoint graf adiacență
├── components/
│   ├── HartaUat.tsx           # Componentă hartă Leaflet pe Canvas cu rețea rutieră și granițe județene
│   ├── HartaWrapper.tsx       # Dynamic wrapper client-only (fără SSR)
│   ├── BaraSus.tsx            # Bară comenzi (comutator domeniu, căutare autocomplete, vederi, slider prag)
│   ├── BaraCautare.tsx        # Căutare UAT/județ cu debounce 250ms, hairline divider și fitBounds
│   ├── Legenda.tsx            # Legendă vizuală jos-stânga, colapsabilă (Alertă, Sănătos, Neutru)
│   ├── PanouLateral.tsx       # Panou glisant la click pe UAT (bare financiare de magnitudine)
│   ├── BaraSumar.tsx          # Bară inferioară cu totaluri și economii calculate
│   └── PanouEditare.tsx       # Panou pentru modul de editare manuală
├── lib/
│   ├── algoritmComasare.ts    # Implementare algoritm greedy și comasare manuală
│   ├── types.ts               # Tipuri TypeScript (UAT, Adiacență, Scenariu, Grup)
│   ├── formatters.ts          # Formatare numere și sume în lei
│   └── supabase.ts            # Client Supabase cu fallback la date locale
├── scripts/
│   ├── 01_descarca_date.py    # Descărcare automată surse originale
│   ├── 02_proceseaza_date.py  # Curățare, unificare SIRUTA și generare JSON-uri
│   ├── 03_seed_supabase.py    # Import în baza de date Supabase / PostGIS
│   ├── 04_genereaza_judete.py # Dizolvare UAT-uri în granițe județene și calcul centroizi
│   ├── 05_descarca_drumuri.py # Extragere statică și simplificare rețea rutieră OSM Geofabrik
│   ├── test_algoritm.py       # Teste automate de integritate (Argeș)
│   └── test_national.py       # Teste automate de integritate (Național)
├── supabase/
│   └── migrations/
│       ├── 20260914000000_init_uat_schema.sql  # Migrație SQL inițială
│       └── 20260914000001_create_judet_geom.sql # Tabel judet_geom (ST_Union + ST_Centroid)
└── public/
    └── data/
        ├── uat_arges.json         # Subset județ de test (102 UAT-uri)
        ├── adiacenta_arges.json
        ├── judete_arges.json      # Graniță județeană Argeș
        ├── drumuri_arges.json     # Rețea autostrăzi + drumuri naționale Argeș (4.430 segmente)
        ├── uat_national.json      # Setul național complet (3.186 UAT-uri)
        ├── adiacenta_national.json
        ├── judete_national.json   # Granițe și centroizi pentru cele 42 de județe
        ├── drumuri_national.json  # Rețea autostrăzi + drumuri naționale România (58.657 segmente)
        └── uat_index.json         # Index căutare rapidă UAT-uri (3.186 înregistrări)
```

---

## Rulare locală

### 1. Instalare dependențe
```bash
npm install
```

### 2. Actualizare / Regenerare date (opțional)
Scripturile Python descarcă și procesează datele din sursele primare:
```bash
python scripts/01_descarca_date.py
python scripts/02_proceseaza_date.py
```

### 3. Rulare teste de integritate
```bash
python scripts/test_algoritm.py
python scripts/test_national.py
```

### 4. Pornire server de dezvoltare
```bash
npm run dev
```
Aplicația este accesibilă la `http://localhost:3000`.

### 5. Compilare pentru producție
```bash
npm run build
npm run start
```

---

## Configurare Supabase (Opțional)

Pentru persistența scenariilor și a geometriei în PostgreSQL cu PostGIS:

1. Creați un proiect pe [Supabase](https://supabase.com).
2. Rulați migrația SQL din `supabase/migrations/20260914000000_init_uat_schema.sql` în SQL Editor.
3. Adăugați fișierul `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<proiect>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<cheie_anon>
   SUPABASE_SERVICE_ROLE_KEY=<cheie_service_role>
   ```
4. Rulați seed-ul:
   ```bash
   python scripts/03_seed_supabase.py --scope arges   # pentru Arges
   python scripts/03_seed_supabase.py --scope all     # pentru toata tara
   ```

---

## Formula de calcul a economiei

La fuzionarea mai multor UAT-uri într-un grup:
1. UAT-ul cu populația maximă din grup devine **UAT principal**, structura sa administrativă fiind păstrată integral.
2. Structurile celorlalte UAT-uri din grup sunt eficientizate prin comasare.
3. **Economia anuală estimată** = $\sum \text{Cheltuieli funcționare membri} - \text{Cheltuieli funcționare UAT principal}$.
4. Cheltuielile de dezvoltare și investițiile nu sunt reduse, întrucât proiectele de infrastructură continuă indiferent de fuziunea administrativă.
