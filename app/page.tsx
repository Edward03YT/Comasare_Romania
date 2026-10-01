'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UatFeatureCollection, UatProperties, AdiacentaMap, GrupComasare } from '@/lib/types';
import { simuleazaComasare, creeazaGrupManual } from '@/lib/algoritmComasare';
import { BaraSus } from '@/components/BaraSus';
import { BaraSumar } from '@/components/BaraSumar';
import { PanouLateral } from '@/components/PanouLateral';
import { PanouEditare } from '@/components/PanouEditare';
import { HartaWrapper } from '@/components/HartaWrapper';
import { Legenda } from '@/components/Legenda';
import { UatItemCautare } from '@/components/BaraCautare';

export default function PaginaPrincipala() {
  const [scop, setScop] = useState<'arges' | 'national'>('arges');
  const [modVizualizare, setModVizualizare] = useState<'actual' | 'scenariu'>('actual');
  const [pragPopulatie, setPragPopulatie] = useState<number>(3000);
  const [modEditare, setModEditare] = useState<boolean>(false);
  const [afiseazaDrumuri, setAfiseazaDrumuri] = useState<boolean>(true);

  const [uatSelectat, setUatSelectat] = useState<UatProperties | null>(null);
  const [focalizeazaSiruta, setFocalizeazaSiruta] = useState<number | null>(null);
  const [selectateManualeIds, setSelectateManualeIds] = useState<number[]>([]);
  const [grupuriManuale, setGrupuriManuale] = useState<GrupComasare[]>([]);

  const [geojson, setGeojson] = useState<UatFeatureCollection | null>(null);
  const [judeteGeojson, setJudeteGeojson] = useState<any | null>(null);
  const [drumuriGeojson, setDrumuriGeojson] = useState<any | null>(null);
  const [adiacenta, setAdiacenta] = useState<AdiacentaMap>({});
  const [indexComplet, setIndexComplet] = useState<UatItemCautare[]>([]);
  const [seIncarca, setSeIncarca] = useState<boolean>(true);

  // Incarcare index complet o singura data pentru cautare instantanee pe toata tara
  useEffect(() => {
    fetch('/data/uat_index.json')
      .then((r) => r.json())
      .then((data: UatItemCautare[]) => setIndexComplet(data))
      .catch((err) => console.error('Eroare la incarcarea indexului UAT:', err));
  }, []);

  // Incarcare date la schimbare scop (Arges vs National)
  useEffect(() => {
    let activ = true;
    setSeIncarca(true);

    const incarcaDate = async () => {
      try {
        const [respGeo, respAdj, respJudete, respDrumuri] = await Promise.all([
          fetch(`/data/uat_${scop}.json`),
          fetch(`/data/adiacenta_${scop}.json`),
          fetch(`/data/judete_${scop}.json`),
          fetch(`/data/drumuri_${scop}.json`),
        ]);

        if (!respGeo.ok || !respAdj.ok || !respJudete.ok || !respDrumuri.ok) {
          throw new Error('Eroare la transferul fisierelor');
        }

        const dataGeo: UatFeatureCollection = await respGeo.json();
        const dataAdj: AdiacentaMap = await respAdj.json();
        const dataJudete = await respJudete.json();
        const dataDrumuri = await respDrumuri.json();

        if (activ) {
          setGeojson(dataGeo);
          setAdiacenta(dataAdj);
          setJudeteGeojson(dataJudete);
          setDrumuriGeojson(dataDrumuri);
          setSelectateManualeIds([]);
          setSeIncarca(false);
        }
      } catch (err) {
        console.error('Eroare la incarcarea datelor:', err);
        if (activ) setSeIncarca(false);
      }
    };

    incarcaDate();

    return () => {
      activ = false;
    };
  }, [scop]);

  // Lista plana de UAT-uri
  const uatList = useMemo(() => {
    if (!geojson) return [];
    return geojson.features.map((f) => f.properties);
  }, [geojson]);

  // Mapare rapida ID -> UatProperties
  const toateUatMap = useMemo(() => {
    const map = new Map<number, UatProperties>();
    for (const uat of uatList) {
      map.set(uat.siruta, uat);
    }
    return map;
  }, [uatList]);

  // Rulare algoritm de simulare comasare
  const scenariu = useMemo(() => {
    return simuleazaComasare(uatList, adiacenta, pragPopulatie, grupuriManuale);
  }, [uatList, adiacenta, pragPopulatie, grupuriManuale]);

  // Gasire grup asociat UAT-ului selectat curent
  const grupAsociat = useMemo(() => {
    if (!uatSelectat) return null;
    return (
      scenariu.grupuri.find((g) => g.membri.includes(uatSelectat.siruta)) || null
    );
  }, [uatSelectat, scenariu.grupuri]);

  // Handlers
  const handleToggleSelectieManual = (siruta: number) => {
    setSelectateManualeIds((prev) => {
      if (prev.includes(siruta)) {
        return prev.filter((id) => id !== siruta);
      }
      return [...prev, siruta];
    });
  };

  const handleUnesteManuale = () => {
    const grupNou = creeazaGrupManual(selectateManualeIds, toateUatMap);
    if (grupNou) {
      setGrupuriManuale((prev) => [...prev, grupNou]);
      setSelectateManualeIds([]);
      setModVizualizare('scenariu');
    }
  };

  const handleDizolvaGrup = (grupId: string) => {
    setGrupuriManuale((prev) => prev.filter((g) => g.id !== grupId));
  };

  const handleReseteazaManuale = () => {
    setGrupuriManuale([]);
    setSelectateManualeIds([]);
  };

  const handleSelectieCautare = (siruta: number) => {
    // Daca UAT-ul e din afara setului curent (ex. suntem pe Arges si selecteaza alt judet)
    const gasitInCurent = geojson?.features.find((f) => f.properties.siruta === siruta);
    if (!gasitInCurent && scop === 'arges') {
      setScop('national');
    }

    setFocalizeazaSiruta(siruta);

    const uatProp = toateUatMap.get(siruta) || indexComplet.find((u) => u.siruta === siruta);
    if (uatProp) {
      setUatSelectat(uatProp as UatProperties);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Bara sus de comenzi */}
      <BaraSus
        scop={scop}
        peSchimbareScop={(s) => {
          setUatSelectat(null);
          setScop(s);
        }}
        modVizualizare={modVizualizare}
        peSchimbareMod={setModVizualizare}
        pragPopulatie={pragPopulatie}
        peSchimbarePrag={setPragPopulatie}
        modEditare={modEditare}
        peComutareEditare={() => {
          setModEditare((prev) => !prev);
          setSelectateManualeIds([]);
        }}
        afiseazaDrumuri={afiseazaDrumuri}
        peComutareDrumuri={() => setAfiseazaDrumuri((prev) => !prev)}
        listaUat={indexComplet.length > 0 ? indexComplet : uatList}
        peSelectieCautare={handleSelectieCautare}
      />

      {/* Zona principala a hartii */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {seIncarca && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: 'var(--cerneala)',
              border: '1px solid var(--neutru)',
              color: 'var(--hartie)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              borderRadius: '2px',
            }}
          >
            Se încarcă datele geografice…
          </div>
        )}

        <HartaWrapper
          geojson={geojson}
          judeteGeojson={judeteGeojson}
          drumuriGeojson={drumuriGeojson}
          afiseazaDrumuri={afiseazaDrumuri}
          scop={scop}
          modVizualizare={modVizualizare}
          pragPopulatie={pragPopulatie}
          uatSelectatId={uatSelectat?.siruta ?? null}
          focalizeazaSiruta={focalizeazaSiruta}
          selectateManualeIds={selectateManualeIds}
          grupuriComasare={scenariu.grupuri}
          modEditare={modEditare}
          peSelectieUat={(uat) => setUatSelectat(uat)}
          peToggleSelectieManual={handleToggleSelectieManual}
          peFinalizareFocalizare={() => setFocalizeazaSiruta(null)}
        />

        {/* Legenda vizuala fixa jos-stanga */}
        <Legenda />

        {/* Panou de editare manuala activat */}
        {modEditare && (
          <PanouEditare
            selectateIds={selectateManualeIds}
            toateUatMap={toateUatMap}
            peUneste={handleUnesteManuale}
            peAnuleazaSelectie={() => setSelectateManualeIds([])}
            peReseteazaManuale={handleReseteazaManuale}
            nrGrupuriManuale={grupuriManuale.length}
          />
        )}

        {/* Panou lateral detalii UAT la click */}
        <PanouLateral
          uat={uatSelectat}
          grupAsociat={grupAsociat}
          toateUatMap={toateUatMap}
          pragPopulatie={pragPopulatie}
          peInchidere={() => setUatSelectat(null)}
          peDizolvaGrup={handleDizolvaGrup}
        />
      </main>

      {/* Bara jos de sumar tehnic */}
      <BaraSumar
        uatInitialeCount={scenariu.uat_initiale_count}
        uatFinaleCount={scenariu.uat_finale_count}
        reducereProcent={scenariu.reducere_procent}
        economieTotala={scenariu.economie_totala}
        scop={scop}
        nrGrupuri={scenariu.grupuri.length}
      />
    </div>
  );
}
