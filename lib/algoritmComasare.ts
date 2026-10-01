import { UatProperties, AdiacentaMap, GrupComasare, ScenariuComasare } from './types';

export function simuleazaComasare(
  uatList: UatProperties[],
  adiacenta: AdiacentaMap,
  pragPopulatie: number,
  grupuriManualeExistente: GrupComasare[] = []
): ScenariuComasare {
  const uatMap = new Map<number, UatProperties>();
  for (const uat of uatList) {
    uatMap.set(uat.siruta, uat);
  }

  const vizitate = new Set<number>();
  const toateGrupurile: GrupComasare[] = [];

  // 1. Integram intai grupurile manuale existente
  for (const grup of grupuriManualeExistente) {
    toateGrupurile.push(grup);
    for (const membru of grup.membri) {
      vizitate.add(membru);
    }
  }

  // 2. Sortam UAT-urile crescator dupa populatie
  const uatSortate = [...uatList].sort((a, b) => a.populatie - b.populatie);

  // 3. Rulam algoritmul greedy de fuzionare
  for (const uat of uatSortate) {
    if (uat.populatie >= pragPopulatie || vizitate.has(uat.siruta)) {
      continue;
    }

    const grupMembri: number[] = [uat.siruta];
    vizitate.add(uat.siruta);
    let populatieGrup = uat.populatie;

    // Obtinem vecinii disponibili
    const obtineVeciniDisponibili = (): number[] => {
      const veciniSet = new Set<number>();
      for (const membruId of grupMembri) {
        const veciniMembru = adiacenta[String(membruId)] || [];
        for (const vId of veciniMembru) {
          if (!vizitate.has(vId) && uatMap.has(vId)) {
            veciniSet.add(vId);
          }
        }
      }
      return Array.from(veciniSet);
    };

    let veciniDisponibili = obtineVeciniDisponibili();

    while (populatieGrup < pragPopulatie && veciniDisponibili.length > 0) {
      // argmax dupa populatie
      let celMaiMareVecinId = veciniDisponibili[0];
      let maxPop = uatMap.get(celMaiMareVecinId)?.populatie ?? -1;

      for (let i = 1; i < veciniDisponibili.length; i++) {
        const vId = veciniDisponibili[i];
        const vPop = uatMap.get(vId)?.populatie ?? -1;
        if (vPop > maxPop) {
          maxPop = vPop;
          celMaiMareVecinId = vId;
        }
      }

      grupMembri.push(celMaiMareVecinId);
      vizitate.add(celMaiMareVecinId);
      populatieGrup += uatMap.get(celMaiMareVecinId)?.populatie ?? 0;

      veciniDisponibili = obtineVeciniDisponibili();
    }

    // Daca grupul are cel putin 2 membri, il salvam
    if (grupMembri.length > 1) {
      // UAT principal = cel cu populatia maxima
      let uatPrincipal = grupMembri[0];
      let maxP = uatMap.get(uatPrincipal)?.populatie ?? -1;

      for (const mId of grupMembri) {
        const p = uatMap.get(mId)?.populatie ?? -1;
        if (p > maxP) {
          maxP = p;
          uatPrincipal = mId;
        }
      }

      let sumaCheltFunctionare = 0;
      for (const mId of grupMembri) {
        sumaCheltFunctionare += uatMap.get(mId)?.cheltuieli_functionare ?? 0;
      }

      const cheltPrincipal = uatMap.get(uatPrincipal)?.cheltuieli_functionare ?? 0;
      const economie = Math.max(0, sumaCheltFunctionare - cheltPrincipal);

      toateGrupurile.push({
        id: `auto-${uat.siruta}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        uat_principal: uatPrincipal,
        membri: grupMembri,
        populatie_totala: populatieGrup,
        cheltuieli_functionare_cumulat: sumaCheltFunctionare,
        economie_estimata: economie,
        este_manual: false
      });
    }
  }

  // 4. Calcul totaluri scenariu
  const uatInGrupuri = new Set<number>();
  let economieTotala = 0;

  for (const g of toateGrupurile) {
    economieTotala += g.economie_estimata;
    for (const m of g.membri) {
      uatInGrupuri.add(m);
    }
  }

  const uatNecomasate = uatList.length - uatInGrupuri.size;
  const uatFinale = uatNecomasate + toateGrupurile.length;
  const reducereProcent = uatList.length > 0
    ? ((uatList.length - uatFinale) / uatList.length) * 100
    : 0;

  return {
    id: `scenariu-${pragPopulatie}`,
    nume: `Scenariu prag ${pragPopulatie.toLocaleString('ro-RO')} locuitori`,
    prag_populatie: pragPopulatie,
    grupuri: toateGrupurile,
    uat_initiale_count: uatList.length,
    uat_finale_count: uatFinale,
    reducere_procent: Math.round(reducereProcent * 10) / 10,
    economie_totala: Math.round(economieTotala)
  };
}

export function creeazaGrupManual(
  membriIds: number[],
  uatMap: Map<number, UatProperties>
): GrupComasare | null {
  if (membriIds.length < 2) return null;

  let uatPrincipal = membriIds[0];
  let maxP = uatMap.get(uatPrincipal)?.populatie ?? -1;
  let popTotala = 0;
  let sumaCheltFunctionare = 0;

  for (const id of membriIds) {
    const uat = uatMap.get(id);
    if (!uat) continue;
    popTotala += uat.populatie;
    sumaCheltFunctionare += uat.cheltuieli_functionare;
    if (uat.populatie > maxP) {
      maxP = uat.populatie;
      uatPrincipal = id;
    }
  }

  const cheltPrincipal = uatMap.get(uatPrincipal)?.cheltuieli_functionare ?? 0;
  const economie = Math.max(0, sumaCheltFunctionare - cheltPrincipal);

  return {
    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    uat_principal: uatPrincipal,
    membri: membriIds,
    populatie_totala: popTotala,
    cheltuieli_functionare_cumulat: sumaCheltFunctionare,
    economie_estimata: economie,
    este_manual: true
  };
}
