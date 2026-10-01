import React from 'react';
import { formatNum } from '@/lib/formatters';
import { BaraCautare, UatItemCautare } from './BaraCautare';

interface BaraSusProps {
  scop: 'arges' | 'national';
  peSchimbareScop: (scop: 'arges' | 'national') => void;
  modVizualizare: 'actual' | 'scenariu';
  peSchimbareMod: (mod: 'actual' | 'scenariu') => void;
  pragPopulatie: number;
  peSchimbarePrag: (prag: number) => void;
  modEditare: boolean;
  peComutareEditare: () => void;
  afiseazaDrumuri: boolean;
  peComutareDrumuri: () => void;
  listaUat?: UatItemCautare[];
  peSelectieCautare?: (siruta: number) => void;
}

export const BaraSus: React.FC<BaraSusProps> = ({
  scop,
  peSchimbareScop,
  modVizualizare,
  peSchimbareMod,
  pragPopulatie,
  peSchimbarePrag,
  modEditare,
  peComutareEditare,
  afiseazaDrumuri,
  peComutareDrumuri,
  listaUat = [],
  peSelectieCautare,
}) => {
  return (
    <header
      style={{
        height: '52px',
        minHeight: '52px',
        backgroundColor: 'var(--cerneala)',
        borderBottom: '1px solid var(--neutru)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        zIndex: 1000,
        position: 'relative',
        gap: '12px',
        whiteSpace: 'nowrap',
      }}
    >
      {/* 1. Brand, Domeniu si Cautare */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1
            style={{
              fontSize: '13.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            Harta comasărilor
          </h1>
          <span
            style={{
              fontSize: '10px',
              color: 'var(--neutru)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            Instrument analitic · Date oficiale
          </span>
        </div>

        {/* Selector domeniu: Judet test vs National */}
        <div style={{ display: 'flex', border: '1px solid var(--neutru)', borderRadius: '2px', flexShrink: 0 }}>
          <button
            onClick={() => peSchimbareScop('arges')}
            className={scop === 'arges' ? 'activ' : ''}
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              border: 'none',
              borderRight: '1px solid var(--neutru)',
              whiteSpace: 'nowrap',
            }}
          >
            Argeș (test)
          </button>
          <button
            onClick={() => peSchimbareScop('national')}
            className={scop === 'national' ? 'activ' : ''}
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Toată România (3.186 UAT)
          </button>
        </div>

        {/* Cautare UAT / judet */}
        {peSelectieCautare && (
          <BaraCautare listaUat={listaUat} peSelectie={peSelectieCautare} />
        )}
      </div>

      {/* Separator discret */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(139, 132, 120, 0.3)', flexShrink: 0 }} />

      {/* 2. Control prag populatie */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            fontSize: '11.5px',
            color: 'var(--neutru)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          Prag minim:
        </span>
        <span
          className="mono-num"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--semnal)',
            whiteSpace: 'nowrap',
          }}
        >
          {formatNum(pragPopulatie)} loc.
        </span>
        <input
          type="range"
          min="1000"
          max="10000"
          step="500"
          value={pragPopulatie}
          onChange={(e) => peSchimbarePrag(Number(e.target.value))}
          style={{ width: '90px', cursor: 'pointer', flexShrink: 0 }}
        />

        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
          <button
            onClick={() => peSchimbarePrag(3000)}
            className={pragPopulatie === 3000 ? 'activ' : ''}
            style={{ padding: '2px 6px', fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            3.000
          </button>
          <button
            onClick={() => peSchimbarePrag(5000)}
            className={pragPopulatie === 5000 ? 'activ' : ''}
            style={{ padding: '2px 6px', fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            5.000
          </button>
        </div>
      </div>

      {/* Separator discret */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(139, 132, 120, 0.3)', flexShrink: 0 }} />

      {/* 3. Butoane Actiune: Drumuri, Vederi, Editare manuala */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Toggle Drumuri */}
        <button
          onClick={peComutareDrumuri}
          className={afiseazaDrumuri ? 'activ' : ''}
          style={{
            padding: '4px 9px',
            fontSize: '11.5px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          title="Afișează sau ascunde rețeaua rutieră pe hartă"
        >
          {afiseazaDrumuri ? 'Drumuri (on)' : 'Drumuri (off)'}
        </button>

        {/* Comutator Situatie / Scenariu */}
        <div style={{ display: 'flex', border: '1px solid var(--neutru)', borderRadius: '2px', flexShrink: 0 }}>
          <button
            onClick={() => peSchimbareMod('actual')}
            className={modVizualizare === 'actual' ? 'activ' : ''}
            style={{
              padding: '4px 9px',
              fontSize: '11.5px',
              border: 'none',
              borderRight: '1px solid var(--neutru)',
              whiteSpace: 'nowrap',
            }}
          >
            Situație actuală
          </button>
          <button
            onClick={() => peSchimbareMod('scenariu')}
            className={modVizualizare === 'scenariu' ? 'activ' : ''}
            style={{
              padding: '4px 9px',
              fontSize: '11.5px',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Simulare comasare
          </button>
        </div>

        {/* Buton Editare manuala */}
        <button
          onClick={peComutareEditare}
          className={modEditare ? 'activ' : ''}
          style={{
            padding: '4px 11px',
            fontSize: '11.5px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {modEditare ? 'Închide editarea' : 'Editare manuală'}
        </button>
      </div>
    </header>
  );
};
