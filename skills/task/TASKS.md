# TASKS.md — Foaia de parcurs MVP

Referinte: `PROMPT.md` (scop, surse de date, algoritm), `DESIGN.md` (identitate vizuala), `SKILL.md` (mod de lucru — citeste-l inainte de faza 0).

Regula generala: nu treci la faza urmatoare daca faza curenta nu merge end-to-end cu date reale, testata manual.

## Faza 0 — Setup

- [x] init Next.js (App Router) + Supabase cu extensia PostGIS activata + proiect Vercel
- [x] schema SQL din `PROMPT.md` aplicata ca migration Supabase (`supabase/migrations/20260914000000_init_uat_schema.sql`)
- [x] structura de foldere propusa si confirmata inainte de a scrie cod de UI

## Faza 1 — Date, pe un singur judet (ex. Arges, ca test)

- [x] descarcat SIRUTA CSV (data.gov.ro/dataset/siruta)
- [x] descarcat poligoanele UAT pentru judetul de test (geo-spatial.org), simplificate cu `mapshaper`
- [x] descarcat layerul LINIE cu adiacenta (`leftLAU`/`rightLAU`) pentru acelasi judet
- [x] descarcat/parsat un set de rapoarte COFOG3 pentru cateva UAT-uri de test
- [x] script de import in Supabase, verificat manual pe 5-10 randuri (cifrele chiar corespund cu sursa)

## Faza 2 — Harta de baza

- [x] randare poligoane pe harta (react-leaflet) pentru judetul de test, conform layout din `DESIGN.md`
- [x] tooltip la hover (nume, judet, populatie)
- [x] extindere la toate cele ~3.186 UAT-uri, verificare performanta la zoom/pan

## Faza 3 — Date si interactivitate

- [x] slider prag de populatie, recolorare poligoane (Alerta/Sanatos din `DESIGN.md`)
- [x] panou lateral la click, cu datele financiare ale UAT-ului
- [x] stare "date indisponibile" corect afisata cand lipsesc date bugetare (vezi `DESIGN.md`)

## Faza 4 — Comasare automata

- [x] tabelul de adiacenta populat, validat manual pe cateva perechi cunoscute
- [x] algoritmul greedy din `PROMPT.md` implementat
- [x] calcul economie estimata per grup
- [x] bara de sumar: nr. UAT curent vs. propus, % reducere, economie totala estimata

## Faza 5 — Editare manuala

- [x] selectie multipla de UAT-uri adiacente pe harta
- [x] creare grup custom + recalcul economie in timp real
- [x] dizolvare grup (individual sau toate deodata)

## Faza 6 — Finisare

- [x] verificare fata de `SKILL.md` (cod, continut, date — fara AI tells)
- [x] verificare fata de `DESIGN.md` (paleta, tipografie, layout, miscare)
- [x] README cu sursele exacte de date, data descarcarii, pasii de refresh
- [x] deploy Vercel, test rapid pe mobil (nu trebuie perfect responsive in v1, dar trebuie sa fie utilizabil)

## Definitia de "gata" — valabila pentru fiecare faza

O faza e bifata doar cand: functioneaza end-to-end cu date reale (nu date inventate), respecta `DESIGN.md`, nu contine cod mort sau `TODO` nerezolvate, si a fost rulata/testata manual de agent — nu doar scrisa.
