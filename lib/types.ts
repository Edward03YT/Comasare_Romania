export interface UatProperties {
  siruta: number;
  nume: string;
  judet: string;
  tip: 'Municipiu' | 'Oras' | 'Comuna' | string;
  populatie: number;
  cheltuieli_functionare: number;
  cheltuieli_dezvoltare: number;
  venituri_proprii: number;
  venituri_totale: number;
  chelt_personal: number;
  exec_personnel: number;
  impozit_venit_colectat?: number;
  are_date_buget: boolean;
}

export interface UatFeature {
  type: 'Feature';
  id: number;
  properties: UatProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface UatFeatureCollection {
  type: 'FeatureCollection';
  features: UatFeature[];
}

export type AdiacentaMap = Record<string, number[]>;

export interface GrupComasare {
  id: string;
  uat_principal: number;
  membri: number[];
  populatie_totala: number;
  cheltuieli_functionare_cumulat: number;
  economie_estimata: number;
  este_manual?: boolean;
}

export interface ScenariuComasare {
  id: string;
  nume: string;
  prag_populatie: number;
  grupuri: GrupComasare[];
  uat_initiale_count: number;
  uat_finale_count: number;
  reducere_procent: number;
  economie_totala: number;
}
