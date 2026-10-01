import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { UatFeatureCollection, UatProperties, GrupComasare } from '@/lib/types';

interface HartaUatProps {
  geojson: UatFeatureCollection | null;
  judeteGeojson?: any | null;
  drumuriGeojson?: any | null;
  afiseazaDrumuri?: boolean;
  scop: 'arges' | 'national';
  modVizualizare: 'actual' | 'scenariu';
  pragPopulatie: number;
  uatSelectatId: number | null;
  focalizeazaSiruta?: number | null;
  selectateManualeIds: number[];
  grupuriComasare: GrupComasare[];
  modEditare: boolean;
  peSelectieUat: (uat: UatProperties) => void;
  peToggleSelectieManual: (siruta: number) => void;
  peFinalizareFocalizare?: () => void;
}

// Subcomponent pentru urmarire zoom
const ObservatorZoom: React.FC<{ peSchimbareZoom: (z: number) => void }> = ({ peSchimbareZoom }) => {
  const map = useMapEvents({
    zoomend: () => peSchimbareZoom(map.getZoom()),
  });
  useEffect(() => {
    peSchimbareZoom(map.getZoom());
  }, [map, peSchimbareZoom]);
  return null;
};

// Subcomponent pentru re-centrare si auto-fit la schimbarea judet/tara
const ControllerVizualizare: React.FC<{ scop: 'arges' | 'national' }> = ({ scop }) => {
  const map = useMap();
  useEffect(() => {
    if (scop === 'arges') {
      // Bounding box / centru Arges
      map.setView([44.95, 24.85], 9, { animate: true });
    } else {
      // Bounding box / centru Romania
      map.setView([45.9432, 24.9668], 7, { animate: true });
    }
  }, [scop, map]);
  return null;
};

// Subcomponent pentru focalizare (fitBounds) pe UAT la selectie din cautare
const ControllerFocalizareUat: React.FC<{
  focalizeazaSiruta?: number | null;
  geojson: UatFeatureCollection | null;
  peFinalizareFocalizare?: () => void;
}> = ({ focalizeazaSiruta, geojson, peFinalizareFocalizare }) => {
  const map = useMap();
  useEffect(() => {
    if (!focalizeazaSiruta || !geojson) return;
    const feat = geojson.features.find((f) => f.properties.siruta === focalizeazaSiruta);
    if (!feat) return;

    try {
      const bounds = L.geoJSON(feat as any).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          maxZoom: 12,
          padding: [60, 60],
          animate: true,
          duration: 0.8,
        });
      }
    } catch (e) {
      console.warn('Eroare la fitBounds pentru UAT:', e);
    }

    if (peFinalizareFocalizare) {
      peFinalizareFocalizare();
    }
  }, [focalizeazaSiruta, geojson, map, peFinalizareFocalizare]);

  return null;
};

// Generare paleta armonioasa pentru grupurile de comasare
const PALETA_GRUPURI = [
  '#4A6B82', '#6B5B7B', '#8E7970', '#5B7065', '#7A6855',
  '#53687E', '#6C7A89', '#5E7D7E', '#786C5A', '#635D7A'
];

export const HartaUat: React.FC<HartaUatProps> = ({
  geojson,
  judeteGeojson,
  drumuriGeojson,
  afiseazaDrumuri = true,
  scop,
  modVizualizare,
  pragPopulatie,
  uatSelectatId,
  focalizeazaSiruta,
  selectateManualeIds,
  grupuriComasare,
  modEditare,
  peSelectieUat,
  peToggleSelectieManual,
  peFinalizareFocalizare,
}) => {
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [nivelZoom, setNivelZoom] = useState<number>(scop === 'arges' ? 9 : 7);

  // Stil pentru reteaua rutiera (galben Semnal #C9A227 conform cerintei utilizatorului)
  const stilDrum = (feature: any) => {
    const tip = feature?.properties?.tip;
    const fclass = feature?.properties?.fclass;
    const esteAutostrada = tip === 'motorway' || fclass === 'motorway' || fclass === 'motorway_link';

    if (esteAutostrada) {
      return {
        color: '#C9A227', // Galben Semnal plin
        weight: 2.2,
        opacity: 0.95,
        interactive: false,
      };
    }

    // Drum national (trunk, primary)
    return {
      color: '#C9A227', // Galben Semnal opacitate medie
      weight: 1.2,
      opacity: 0.55,
      interactive: false,
    };
  };

  // Stil pentru layerul de granite de judet (fara umplere, contur distinct)
  const stilJudet = () => {
    const esteZoomApropiat = nivelZoom >= 9;
    return {
      fill: false,
      fillOpacity: 0,
      color: esteZoomApropiat ? '#8B8478' : '#1B2430',
      weight: esteZoomApropiat ? 1.4 : 2.4,
      opacity: esteZoomApropiat ? 0.7 : 0.95,
      interactive: false,
    };
  };

  // Mapare rapidă: siruta -> grup_index
  const uatLaGrupMap = React.useMemo(() => {
    const map = new Map<number, { index: number; grup: GrupComasare }>();
    grupuriComasare.forEach((grup, idx) => {
      for (const mId of grup.membri) {
        map.set(mId, { index: idx, grup });
      }
    });
    return map;
  }, [grupuriComasare]);

  // Functie stilizare poligoane
  const stilPoligon = (feature: any) => {
    const p: UatProperties = feature?.properties;
    if (!p) return {};

    const siruta = p.siruta;
    const esteInPanou = siruta === uatSelectatId;
    const esteInSelectieManuala = selectateManualeIds.includes(siruta);
    const esteSelectat = esteInPanou || esteInSelectieManuala;

    let fillColor = '#8B8478'; // Neutru
    let fillOpacity = 0.55;

    if (modVizualizare === 'actual') {
      if (!p.are_date_buget) {
        fillColor = '#8B8478';
        fillOpacity = 0.35;
      } else if (p.populatie < pragPopulatie || p.venituri_proprii < p.cheltuieli_functionare) {
        fillColor = '#B23A2E'; // Alerta
        fillOpacity = 0.65;
      } else {
        fillColor = '#4C6B4F'; // Sanatos
        fillOpacity = 0.65;
      }
    } else {
      // Mod scenariu
      const grupInfo = uatLaGrupMap.get(siruta);
      if (grupInfo) {
        const culoareGrup = PALETA_GRUPURI[grupInfo.index % PALETA_GRUPURI.length];
        fillColor = culoareGrup;
        // Daca e UAT-ul principal pastrat, facem culoarea mai saturata
        fillOpacity = (siruta === grupInfo.grup.uat_principal) ? 0.85 : 0.6;
      } else {
        // UAT independent necomasat
        fillColor = p.populatie >= pragPopulatie ? '#4C6B4F' : '#8B8478';
        fillOpacity = 0.5;
      }
    }

    if (esteSelectat) {
      return {
        fillColor,
        fillOpacity: 0.85,
        color: '#C9A227', // Semnal
        weight: 3,
        opacity: 1,
      };
    }

    return {
      fillColor,
      fillOpacity,
      color: '#1B2430',
      weight: scop === 'national' ? 0.6 : 1,
      opacity: 0.85,
    };
  };

  const modEditareRef = useRef(modEditare);
  modEditareRef.current = modEditare;

  const peToggleSelectieManualRef = useRef(peToggleSelectieManual);
  peToggleSelectieManualRef.current = peToggleSelectieManual;

  const peSelectieUatRef = useRef(peSelectieUat);
  peSelectieUatRef.current = peSelectieUat;

  const selectateManualeIdsRef = useRef(selectateManualeIds);
  selectateManualeIdsRef.current = selectateManualeIds;

  const uatSelectatIdRef = useRef(uatSelectatId);
  uatSelectatIdRef.current = uatSelectatId;

  // Re-stilizare instanta la schimbare stare (fara re-render intreg GeoJSON)
  useEffect(() => {
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.setStyle(stilPoligon);
    }
  }, [
    modVizualizare,
    pragPopulatie,
    uatSelectatId,
    selectateManualeIds,
    uatLaGrupMap,
    scop
  ]);

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const p: UatProperties = feature.properties;
    if (!p) return;

    // Tooltip tehnic cadastral
    layer.bindTooltip(
      `<div style="font-family: var(--font-condensed); font-size: 13px;">
        <strong style="text-transform: uppercase;">${p.nume}</strong> (${p.judet})<br/>
        <span style="font-family: var(--font-mono); font-size: 11px; color: #C9A227;">
          SIRUTA ${p.siruta} · ${p.populatie.toLocaleString('ro-RO')} loc.
        </span>
      </div>`,
      {
        sticky: true,
        className: 'leaflet-tooltip-cadastral',
        direction: 'top',
        offset: [0, -10],
      }
    );

    layer.on({
      click: () => {
        if (modEditareRef.current) {
          peToggleSelectieManualRef.current(p.siruta);
        } else {
          peSelectieUatRef.current(p);
        }
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (!selectateManualeIdsRef.current.includes(p.siruta) && p.siruta !== uatSelectatIdRef.current) {
          l.setStyle({ weight: 2.2, color: '#EFEAE0' });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        if (!selectateManualeIdsRef.current.includes(p.siruta) && p.siruta !== uatSelectatIdRef.current) {
          l.setStyle(stilPoligon(feature));
        }
      },
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={scop === 'arges' ? [44.95, 24.85] : [45.9432, 24.9668]}
        zoom={scop === 'arges' ? 9 : 7}
        preferCanvas={true}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <ControllerVizualizare scop={scop} />
        <ObservatorZoom peSchimbareZoom={setNivelZoom} />
        <ControllerFocalizareUat
          focalizeazaSiruta={focalizeazaSiruta}
          geojson={geojson}
          peFinalizareFocalizare={peFinalizareFocalizare}
        />

        {/* Tile layer gratuit OpenStreetMap fara watermark, stilizat ca fundal cadastral Hartie */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributori'
          className="harta-tile-cadastral"
          maxZoom={18}
          minZoom={6}
        />

        {/* Layer UAT-uri (dedesubt, interactiv) */}
        {geojson && (
          <GeoJSON
            key={`uat-${scop}-${geojson.features.length}`}
            ref={geojsonLayerRef}
            data={geojson as any}
            style={stilPoligon}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Layer Rețea Rutieră (autostrăzi + drumuri naționale, galben) */}
        {afiseazaDrumuri && drumuriGeojson && (
          <GeoJSON
            key={`drumuri-${scop}-${drumuriGeojson.features?.length || 0}`}
            data={drumuriGeojson as any}
            style={stilDrum}
            interactive={false}
          />
        )}

        {/* Layer Granițe Județene (deasupra, fără umplere, contur distinct) */}
        {judeteGeojson && (
          <GeoJSON
            key={`judete-${scop}-${nivelZoom >= 9 ? 'aproape' : 'departe'}`}
            data={judeteGeojson as any}
            style={stilJudet}
            interactive={false}
          />
        )}

        {/* Etichete cartografice cu numele județelor pe centroizi la zoom de țară/regiune */}
        {nivelZoom <= 8 &&
          judeteGeojson?.features?.map((feat: any) => {
            const centroid = feat.properties?.centroid;
            if (!centroid || centroid.length < 2) return null;
            const numeJudet = feat.properties?.nume_formatat || feat.properties?.judet || '';
            const icon = L.divIcon({
              className: 'eticheta-judet-wrapper',
              html: `<span class="eticheta-judet-text">${numeJudet}</span>`,
              iconSize: [120, 20],
              iconAnchor: [60, 10],
            });
            return (
              <Marker
                key={`judet-label-${numeJudet}`}
                position={[centroid[0], centroid[1]]}
                icon={icon}
                interactive={false}
              />
            );
          })}
      </MapContainer>
    </div>
  );
};
