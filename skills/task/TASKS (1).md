# TASKS.md — Foaia de parcurs MVP

Referinte: `PROMPT.md` (scop, surse de date, algoritm), `DESIGN.md` (identitate vizuala), `SKILL.md` (mod de lucru — citeste-l inainte de faza 0).

Regula generala: nu treci la faza urmatoare daca faza curenta nu merge end-to-end cu date reale, testata manual.

## Faza 0 — Setup

- [ ] init Next.js (App Router) + Supabase cu extensia PostGIS activata + proiect Vercel
- [ ] schema SQL din `PROMPT.md` aplicata ca migration Supabase
- [ ] structura de foldere propusa si confirmata inainte de a scrie cod de UI

## Faza 1 — Date, pe un singur judet (ex. Arges, ca test)

- [ ] descarcat SIRUTA CSV (data.gov.ro/dataset/siruta)
- [ ] descarcat poligoanele UAT pentru judetul de test (geo-spatial.org), simplificate cu `mapshaper`
- [ ] descarcat layerul LINIE cu adiacenta (`leftLAU`/`rightLAU`) pentru acelasi judet
- [ ] descarcat/parsat un set de rapoarte COFOG3 pentru cateva UAT-uri de test
- [ ] script de import in Supabase, verificat manual pe 5-10 randuri (cifrele chiar corespund cu sursa)

## Faza 2 — Harta de baza

- [ ] randare poligoane pe harta (react-leaflet) pentru judetul de test, conform layout din `DESIGN.md`
- [ ] tooltip la hover (nume, judet, populatie)
- [ ] extindere la toate cele ~3.186 UAT-uri, verificare performanta la zoom/pan

## Faza 3 — Date si interactivitate

- [ ] slider prag de populatie, recolorare poligoane (Alerta/Sanatos din `DESIGN.md`)
- [ ] panou lateral la click, cu datele financiare ale UAT-ului
- [ ] stare "date indisponibile" corect afisata cand lipsesc date bugetare (vezi `DESIGN.md`)

## Faza 4 — Comasare automata

- [ ] tabelul de adiacenta populat, validat manual pe cateva perechi cunoscute
- [ ] algoritmul greedy din `PROMPT.md` implementat
- [ ] calcul economie estimata per grup
- [ ] bara de sumar: nr. UAT curent vs. propus, % reducere, economie totala estimata

## Faza 5 — Editare manuala

- [ ] selectie multipla de UAT-uri adiacente pe harta
- [ ] creare grup custom + recalcul economie in timp real
- [ ] dizolvare grup (individual sau toate deodata)

## Faza 6 — Finisare

- [ ] verificare fata de `SKILL.md` (cod, continut, date — fara AI tells)
- [ ] verificare fata de `DESIGN.md` (paleta, tipografie, layout, miscare)
- [ ] README cu sursele exacte de date, data descarcarii, pasii de refresh
- [ ] deploy Vercel, test rapid pe mobil (nu trebuie perfect responsive in v1, dar trebuie sa fie utilizabil)

## Faza 7 — Imbunatatiri harta si panou de date

- [ ] layer separat pentru granitele de judet (dissolve UAT-uri dupa `judet` in PostGIS), contur mai gros decat UAT-urile, fara umplere
- [ ] etichete cu numele judetului pe harta, vizibile la zoom de tara/regiune
- [ ] cifrele financiare din panoul lateral rescrise ca bare de citire (eticheta + bara + valoare IBM Plex Mono), conform `DESIGN.md`

## Definitia de "gata" — valabila pentru fiecare faza

O faza e bifata doar cand: functioneaza end-to-end cu date reale (nu date inventate), respecta `DESIGN.md`, nu contine cod mort sau `TODO` nerezolvate, si a fost rulata/testata manual de agent — nu doar scrisa.
