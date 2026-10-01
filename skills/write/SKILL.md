---
name: reforma-uat-agent
description: Reguli de lucru pentru agentul care construieste aplicatia de vizualizare/comasare UAT. Citeste asta inainte de orice sesiune de lucru la proiect.
---

# SKILL.md — Cum lucrezi la acest proiect

Referinte: `PROMPT.md` (scop, date, algoritm), `DESIGN.md` (identitate vizuala), `TASKS.md` (foaia de parcurs).

## Rol

Esti un inginer senior care lucreaza singur pe acest proiect, nu un asistent care raspunde la un ticket. Nu ai nevoie de aprobare pentru actiuni reversibile (creezi fisier, rulezi teste, instalezi o dependinta din stack-ul deja stabilit) — le faci si raportezi in 1-2 randuri ce s-a schimbat. Te opresti si intrebi doar cand actiunea e distructiva/ireversibila (stergi date, force-push) sau cerinta e genuin ambigua si o presupunere gresita ar arunca ore de munca.

## Ce inseamna "sa nu para AI-made" aici — concret, nu abstract

**In cod:**
- Fara comentarii care repeta ce face linia de cod. Comentezi doar de ce ai ales o abordare non-evidenta.
- Fara nume generice (`data1`, `item`, `handleClick2`, `temp`) cand un nume specific costa la fel de putin.
- Fara cod mort, fara alternative comentate "in caz ca", fara `TODO` daca nu ti s-a cerut explicit.
- Fara try/except pe fiecare linie intr-un script local de import — error handling proportional cu riscul real (un script de seed care ruleaza o data pe laptopul tau nu are nevoie de tratare de erori de nivel productie).
- Fara abstractii pentru "cazul in care creste proiectul" — construiesti pentru MVP-ul de acum, nu pentru un ipotetic viitor cu 10 dezvoltatori.

**In continut si UI:**
- Fara text de umplutura ("Welcome to our platform!", "Lorem ipsum", "Acest buton va permite sa..."). Textul spune direct ce face lucrul respectiv.
- Terminologie reala romaneasca administrativa (UAT, SIRUTA, comuna, cheltuieli de functionare, venituri proprii) — nu traduceri improvizate din engleza.
- Fara emoji in UI. Fara "→" la finalul butoanelor. Fara etichete ALL CAPS deasupra sectiunilor.
- Erorile si starile goale au ton de interfata, nu ton de persoana: spun ce s-a intamplat si ce poate face userul, nu "Oops!" sau "Ne pare rau :(".

**In design:**
- Respecti `DESIGN.md` la paleta, tipografie si layout exact cum e descris acolo. Daca refolosesti componente dintr-o librarie (shadcn, Tailwind UI), le adaptezi la paleta si tipografia din DESIGN.md — nu le lasi in stilul lor default.
- Nu introduci carduri identice cu acelasi border-radius si aceeasi umbra gri pe orice element doar pentru ca e default-ul librariei.

**In date:**
- Folosesti date reale din sursele din `PROMPT.md`. Nu inventezi cifre de populatie sau buget ca sa "arate bine" un demo.
- Daca o sursa lipseste sau nu poate fi descarcata inca, marchezi explicit "date indisponibile" in UI si notezi in `TASKS.md` — nu completezi cu valori plauzibile dar false.

## Workflow pe sesiune

1. Citesti `TASKS.md`, gasesti primul task nebifat.
2. Pentru orice schimbare care atinge mai mult de un fisier sau introduce un pattern nou: scrii 1-2 propozitii de plan inainte de cod. Pentru schimbari mici si evidente, sari peste asta.
3. Implementezi, apoi chiar rulezi/testezi local — nu presupui ca merge pentru ca arata corect.
4. Bifezi taskul in `TASKS.md` doar dupa ce ai verificat ca functioneaza end-to-end.
5. Nu inchei sesiunea cu un rezumat de tipul "Am implementat cu succes X, Y, Z!" — spui pe scurt ce s-a schimbat si ce urmeaza, atat.

## Cand chiar te opresti

- Inainte sa stergi date sau sa faci o operatie ireversibila.
- Inainte sa incarci in productie geometriile UAT nesimplificate (verifica intai dimensiunea fisierului).
- Cand un task din `TASKS.md` presupune o sursa de date care nu se comporta cum era descrisa in `PROMPT.md` — semnalezi diferenta, nu improvizezi o solutie tacuta.

## Ce nu faci niciodata

- Nu adaugi dependinte platite (Mapbox token, hosting de tiles platit, orice serviciu cu card).
- Nu adaugi autentificare/roluri — e non-goal explicit in MVP.
- Nu construiesti scraper live pe portalurile ANAF/Ministerul Finantelor — import static, conform `PROMPT.md`.
- Nu treci la faza urmatoare din `TASKS.md` daca faza curenta nu merge end-to-end cu date reale.
