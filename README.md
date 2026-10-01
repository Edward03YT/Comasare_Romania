# Harta Comasărilor Administrative — România

Instrument analitic și cadru tehnic de dezbatere publică pentru vizualizarea celor **3.186 de unități administrativ-teritoriale (UAT-uri)** din România, analiza indicatorilor fiscali și demografici oficiali și simularea scenariilor de comasare administrativă bazate pe praguri de populație și grafuri de adiacență topologică.

Aplicația include atât setul pilot de testare (județul Argeș, 102 UAT-uri), cât și acoperirea completă la nivel **național** (3.186 UAT-uri, 42 județe și întreaga rețea națională de autostrăzi și drumuri principale).

---

## Funcționalități principale

- **Motor cartografic de înaltă performanță**: Randare pe bază de Leaflet Canvas Renderer (`preferCanvas: true`) cu basemap OpenStreetMap tratat tonal în stil de instrument cadastral.
- **Acoperire dublă (Argeș / Național)**: Comutator instantaneu între județul pilot Argeș și harta completă a României.
- **Granițe și etichete județene**: Layer dedicat pentru conturul celor 42 de județe, cu etichete interactive vizibile la zoom de ansamblu.
- **Rețea rutieră națională (OSM Geofabrik)**: Layer vectorial cu peste 58.000 de segmente de autostrăzi și drumuri naționale, cu posibilitate de afișare/ascundere din bara superioară.
- **Căutare autocomplete inteligentă**: Căutare rapidă indexată pe toate cele 3.186 UAT-uri și 42 de județe, cu debounce de 250ms, auto-centrare (`fitBounds`) și evidențiere pe hartă.
- **Simulare scenariu comasare automată**: Algoritm greedy determinist bazat pe adiacență topologică reală și prag dinamic de populație (reglabil prin slider între 1.500 și 10.000 locuitori).
- **Mod de editare manuală**: Permite selecția individuală a UAT-urilor pe hartă, crearea de grupuri personalizate, dizolvarea grupurilor și recalcularea economiilor în timp real.
- **Panou lateral fiscal detaliat**: Deschidere la click pe orice UAT cu indicatori din execuția bugetară (venituri proprii, cheltuieli de funcționare, cheltuieli de dezvoltare, cheltuieli de personal) sub formă de bare de magnitudine.
- **Bară inferioară de sumar**: Monitorizare permanentă a reducerii administrative: număr UAT-uri inițial vs. rezultat, procentul de comasare și economia bugetară anuală estimată.
- **Legendă cartografică**: Panou colapsabil în colțul din stânga-jos care explică pragurile vizuale (Alertă, Sănătos, Neutru).

---

## Tehnologii și Arhitectură

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **UI & Runtime**: [React 19](https://react.dev/) + React-DOM 19
- **Cartografie**: [Leaflet 1.9](https://leafletjs.com/) + [React-Leaflet 5.0](https://react-leaflet.js.org/)
- **Limbaj**: TypeScript 5.9 (verificare strictă de tipuri)
- **Pictograme & Stil**: Lucide Icons + CSS Variables cu paletă cadastrală dedicată (Cerneală `#1B2430`, Hârtie `#EFEAE0`, Alertă `#B23A2E`, Sănătos `#4C6B4F`, Neutru `#8B8478`, Semnal `#C9A227`)
- **Tipografie**: IBM Plex Sans, IBM Plex Sans Condensed și IBM Plex Mono (cu `tabular-nums` pentru cifre aliniate)
- **Bază de date (opțional)**: [Supabase](https://supabase.com/) cu PostgreSQL + extensia geografică PostGIS

---

## Surse de date oficiale

Toate datele utilizate sunt reale, publice și descărcate direct de pe portalurile guvernamentale și academice:

| Set de date | Sursă oficială | Format original | Rol în aplicație |
|---|---|---|---|
| **Nomenclator SIRUTA** | Institutul Național de Statistică / [data.gov.ro](https://data.gov.ro) | CSV | Nomenclator oficial de coduri UAT, județe și tipuri de localități |
| **Granițe și Poligoane UAT** | ANCPI / [geo-spatial.org](https://services.geo-spatial.org) | Shapefile (WGS84) | Geometrii poligonale simplificate pentru toate cele 3.186 de UAT-uri |
| **Graful de adiacență** | ANCPI / [geo-spatial.org](https://services.geo-spatial.org) (layer LINIE) | Shapefile / DBF | Vecinătăți topologice (`leftId`, `rightId`) pentru fuziuni valide |
| **Date Bugetare & Populație** | Ministerul Finanțelor (rapoarte COFOG3 / Forexe), ANAF & INS (RPL 2021) | JSON structurat | Populație rezidentă, venituri proprii, cheltuieli funcționare/dezvoltare |
| **Rețea rutieră** | OpenStreetMap / [Geofabrik România](https://download.geofabrik.de/europe/romania.html) | Shapefile | Autostrăzi, drumuri expres și drumuri naționale simplificate |

> [!NOTE]
> Seturile de date finale pre-procesate sunt incluse direct în folderul `public/data/`. Aplicația este complet autonomă și poate fi rulată imediat după clonare fără a necesita rularea scripturilor Python de extragere.

---

## Structura proiectului

```
Comasare_Romania/
├── app/
│   ├── layout.tsx             # Layout rădăcină (fonturi IBM Plex, stiluri globale)
│   ├── page.tsx               # Orchestrator principal (hartă, stare globală, comenzi)
│   ├── globals.css            # Tokeni de design cadastral și stiluri globale
│   └── api/
│       ├── uat/route.ts       # Endpoint API GeoJSON pentru UAT-uri (filtrare Argeș / Național / județ)
│       └── adiacenta/route.ts # Endpoint API graf adiacență
├── components/
│   ├── HartaUat.tsx           # Componentă hartă Leaflet (Canvas renderer, drumuri, județe, UAT-uri)
│   ├── HartaWrapper.tsx       # Wrapper dinamic client-only (previne erorile de SSR pentru Leaflet)
│   ├── BaraSus.tsx            # Bară comenzi (comutator domeniu, moduri vizualizare, slider prag, toggle drumuri)
│   ├── BaraCautare.tsx        # Căutare UAT/județ cu debounce 250ms și auto-zoom
│   ├── Legenda.tsx            # Legendă vizuală colapsabilă jos-stânga
│   ├── PanouLateral.tsx       # Panou fiscal detaliat la click pe UAT (bare de magnitudine)
│   ├── BaraSumar.tsx          # Bară inferioară cu totaluri și economii calculate în timp real
│   └── PanouEditare.tsx       # Panou pentru modul de editare și comasare manuală
├── lib/
│   ├── algoritmComasare.ts    # Algoritm greedy determinist și logică de grupare manuală
│   ├── types.ts               # Definiții de tipuri TypeScript (UAT, Scenariu, Grup, Adiacență)
│   ├── formatters.ts          # Utilitare pentru formatare numere și sume în lei
│   └── supabase.ts            # Client Supabase cu fallback transparent la fișiere locale
├── public/
│   └── data/
│       ├── uat_national.json      # Poligoane GeoJSON pentru toate cele 3.186 de UAT-uri din România
│       ├── uat_arges.json         # Poligoane UAT Argeș (subset pilot 102 UAT-uri)
│       ├── adiacenta_national.json # Graful complet de vecinătate la nivel național
│       ├── adiacenta_arges.json   # Graful de vecinătate Argeș
│       ├── judete_national.json   # Contururi și centroizi pentru cele 42 de județe
│       ├── judete_arges.json      # Graniță județeană Argeș
│       ├── drumuri_national.json  # Rețea autostrăzi și drumuri naționale România (58.657 segmente)
│       ├── drumuri_arges.json     # Rețea drumuri principale Argeș (4.430 segmente)
│       └── uat_index.json         # Index complet pentru căutare instantanee
├── scripts/                   # Scripturi Python de descărcare și procesare a datelor brute
│   ├── 01_descarca_date.py    # Descărcare surse primare (SIRUTA, granițe, finanțe)
│   ├── 02_proceseaza_date.py  # Unificare SIRUTA și generare JSON-uri optimizate
│   ├── 03_seed_supabase.py    # Import în PostGIS / Supabase (opțional)
│   ├── 04_genereaza_judete.py # Dizolvare geometrii UAT în granițe județene
│   ├── 05_descarca_drumuri.py # Extragere și simplificare rețea rutieră OSM Geofabrik
│   ├── test_algoritm.py       # Teste de integritate graf de adiacență (Argeș)
│   └── test_national.py       # Teste de integritate graf și acoperire națională
├── supabase/
│   └── migrations/            # Scripturi SQL de migrare pentru PostGIS
│       ├── 20260914000000_init_uat_schema.sql
│       └── 20260914000001_create_judet_geom.sql
├── data_raw/                  # Director păstrat prin .gitkeep pentru descărcări brute (exclus din Git)
└── .gitignore                 # Configurație completă de excludere pentru Git
```

---

## Rulare locală

### Cerințe de sistem
- **Node.js**: versiunea 20+ (recomandat Node.js 22 sau 24 LTS)
- **npm**: versiunea 10+ sau 11+

### 1. Instalare dependențe
```bash
npm install
```

### 2. Pornire server de dezvoltare (Turbopack)
```bash
npm run dev
```
Aplicația se va lansa la adresa: `http://localhost:3000`.

### 3. Compilare pentru producție
```bash
npm run build
npm run start
```

---

## Formula de calcul a economiei financiare

În orice scenariu de fuzionare (fie automat prin algoritmul greedy, fie manual prin selecție):
1. **Identificare pol principal**: UAT-ul cu populația cea mai mare din cadrul noului grup devine centrul administrativ (reședința de comună/oraș), iar aparatul său de funcționare este păstrat integral.
2. **Eficientizare aparat secundar**: Primăriile celorlalte UAT-uri membre sunt reduse la birouri locale / ghișee unice.
3. **Economia anuală estimată**:
   $$\text{Economie} = \sum_{i \in \text{membri}} \text{Cheltuieli funcționare}_i - \text{Cheltuieli funcționare}_{\text{UAT principal}}$$
4. **Protecția investițiilor**: Cheltuielile de dezvoltare și proiectele cu finanțare europeană sau națională nu sunt reduse, continuând conform graficului aprobat.

---

## Configurare Supabase (Opțional)

Dacă doriți persistența scenariilor personalizate într-o bază de date PostgreSQL dedicată:

1. Creați un proiect pe [Supabase](https://supabase.com).
2. Rulați migrațiile SQL din folderul `supabase/migrations/` în SQL Editor.
3. Creați un fișier `.env.local` la rădăcina proiectului:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<proiect>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<cheia_anonima>
   SUPABASE_SERVICE_ROLE_KEY=<cheia_service_role>
   ```
4. Populați baza de date folosind scriptul de seed:
   ```bash
   python scripts/03_seed_supabase.py --scope all
   ```
