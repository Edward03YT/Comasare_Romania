# DESIGN.md — Identitate vizuala: "Instrument cadastral"

Referinte: `PROMPT.md` (context, functionalitati), `SKILL.md` (cum se respecta acest document).

## Ancorare in subiect

Aplicatia citeste date topografice si financiare oficiale ale statului. Directia vizuala nu e "dashboard SaaS" si nu e "site de prezentare" — e un **instrument de masura**, ca un teodolit sau un aparat de topografie: o carcasa inchisa, tehnica, in jurul unei citiri luminoase si precise (harta). Utilizatorul citeste date, nu e vandut ceva.

## Culoare — paleta de baza (6 valori numite)

| Nume | Hex | Rol |
|---|---|---|
| Cerneala | `#1B2430` | fundalul intregii interfete (header, panou lateral, bara de sumar) |
| Hartie | `#EFEAE0` | text pe fundal Cerneala; fundalul de baza al hartii (culoarea "terenului" sub poligoane) |
| Alerta | `#B23A2E` | umplere UAT sub prag / cheltuieli neacoperite de venituri proprii |
| Sanatos | `#4C6B4F` | umplere UAT peste prag / venituri proprii acopera cheltuielile |
| Neutru | `#8B8478` | granite UAT neselectate, text secundar pe Cerneala |
| Semnal | `#C9A227` | singura culoare de "actiune": UAT selectat/in editare, slider activ, buton primar |

Reguli stricte:
- Alerta si Sanatos apar **doar** ca umplere de poligon pe harta si in micro-indicatori numerici asociati (nu ca fundal de sectiune, nu ca buton).
- Semnal e rezervat exclusiv starii active/selectate. Daca totul e galben, nimic nu mai e "selectat".
- Nu adaugi un al saptelea accent "ca sa fie mai viu" — paleta ramane la 6.

## Tipografie

- **Titluri, etichete, chrome UI**: IBM Plex Sans Condensed — latimea condensata evoca fonturile de pe hartile topografice si placutele cadastrale.
- **Corp de text, panouri de date**: IBM Plex Sans.
- **Cifre** (populatie, sume, procente, coduri SIRUTA): IBM Plex Mono, cu `font-variant-numeric: tabular-nums`. Alegere functionala, nu decorativa — coloanele de cifre trebuie sa se alinieze vertical ca sa fie comparabile dintr-o privire.

Toate trei sunt open-source (SIL Open Font License), disponibile gratuit prin Google Fonts sau self-hosted.

Reguli: linii de text sub 80 de caractere, fara CAPS LOCK pe etichete, fara accentuare de un singur cuvant intr-un titlu (fara bold/italic/culoare pe un cuvant izolat).

## Layout

Harta e elementul dominant, full-bleed — nu un "hero" cu text mare deasupra. Structura:

```
+----------------------------------------------------+
| CERNEALA — bara sus: titlu scurt + slider prag      |
+--------------------------------------------+-------+
|                                             | PANOU |
|                                             | later.|
|              HARTA (Hartie + poligoane      | (aparea|
|              colorate Alerta/Sanatos)       | doar la|
|                                             | click) |
|                                             |        |
+--------------------------------------------+-------+
| CERNEALA — bara jos: nr. UAT curent/propus, economie|
+----------------------------------------------------+
```

- Panoul lateral apare doar la click pe un UAT (nu ocupa spatiu permanent daca nu are continut).
- Bordura solida 1px intre zone (Neutru pe Cerneala), fara umbre, fara border-radius sau maxim 2px — o carcasa de instrument are muchii, nu colturi rotunjite de card.
- Bara de sumar (jos) arata ca un afisaj cu cifre, nu ca un card KPI cu iconita si sageata verde.

## Miscare

O singura tranzitie orchestrata: panoul lateral culiseaza din dreapta la click pe un UAT (200-250ms, fara bounce). Recolorarea hartii la schimbarea pragului e o tranzitie de culoare lina, nu instant, nu animatie exagerata. Nimic altceva nu se misca — fara hover-lift pe fiecare element, fara fade-slide-up la scroll (aplicatia e un instrument, nu se deruleaza ca un site de prezentare).

## Componente si stari

- **Loading initial** (incarcare poligoane): scheletul hartii apare imediat cu graniti Neutru, poligoanele se coloreaza pe masura ce datele financiare sosesc — nu un spinner central pe ecran gol.
- **UAT fara date bugetare**: umplere Neutru (nu Alerta, nu Sanatos — lipsa datelor nu inseamna "rau"), text in panou: "Date bugetare indisponibile pentru acest UAT." Atat.
- **Eroare de incarcare date**: ton de interfata — "Datele nu au putut fi incarcate. Reincearca." — nu "Oops! Ceva nu a mers bine :(".
- **Grup de comasare activ**: contur Semnal in jurul tuturor UAT-urilor din grup, panoul arata componenta si economia calculata.

## Scris / microcopy

- Voce activa, numele actiunii ramane acelasi in tot fluxul: butonul "Uneste comunele selectate" produce un mesaj "Comune unite", nu "Succes!".
- Terminologie reala: UAT, SIRUTA, cheltuieli de functionare, venituri proprii — nu "budget items" traduse mot-a-mot.
- Fara "→" pe butoane, fara etichete ALL CAPS, fara metadate legate prin puncte mediane ("A · B · C").

## De evitat explicit (tell-uri generice de AI — nu se potrivesc acestui subiect)

- fundal crem cald + accent terracota (combinatia cliseu de "design generat")
- fundal aproape-negru + un singur accent verde-acid sau vermillion
- carduri identice, acelasi border-radius si aceeasi umbra gri pe orice, indiferent de ierarhie
- gradient-uri decorative fara rol informativ
- eyebrow label ALL CAPS deasupra fiecarui titlu de sectiune
- numerotare 01/02/03 pe continut care nu e de fapt o secventa

## Auto-critica inainte de a considera o faza gata

Fa un screenshot si intreaba-te: ar putea sa fie orice alt dashboard guvernamental generic, sau se vede clar ca e "instrumentul cadastral" descris aici? Daca raspunsul e "ar putea fi oricare", scoate un accent (regula lui Chanel: inainte sa iesi din casa, scoate un accesoriu) sau intareste ceea ce e deja specific — nu adauga decoratie noua.
