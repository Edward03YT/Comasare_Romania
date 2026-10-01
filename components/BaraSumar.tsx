import React from 'react';
import { formatNum, formatRon, formatProcent } from '@/lib/formatters';

interface BaraSumarProps {
  uatInitialeCount: number;
  uatFinaleCount: number;
  reducereProcent: number;
  economieTotala: number;
  scop: 'arges' | 'national';
  nrGrupuri: number;
}

export const BaraSumar: React.FC<BaraSumarProps> = ({
  uatInitialeCount,
  uatFinaleCount,
  reducereProcent,
  economieTotala,
  scop,
  nrGrupuri,
}) => {
  return (
    <footer
      style={{
        height: '48px',
        backgroundColor: 'var(--cerneala)',
        borderTop: '1px solid var(--neutru)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
        position: 'relative',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        {/* Numar UAT curent */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ color: 'var(--neutru)', textTransform: 'uppercase' }}>UAT actuale:</span>
          <span className="mono-num" style={{ fontSize: '15px', fontWeight: 600 }}>
            {formatNum(uatInitialeCount)}
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(139, 132, 120, 0.4)' }} />

        {/* Numar UAT propus */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ color: 'var(--neutru)', textTransform: 'uppercase' }}>UAT după scenariu:</span>
          <span className="mono-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--semnal)' }}>
            {formatNum(uatFinaleCount)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--neutru)' }}>
            ({formatNum(nrGrupuri)} grupuri formate)
          </span>
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(139, 132, 120, 0.4)' }} />

        {/* Reducere procentuala */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ color: 'var(--neutru)', textTransform: 'uppercase' }}>Reducere:</span>
          <span className="mono-num" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--hartie)' }}>
            -{formatProcent(reducereProcent)}
          </span>
        </div>
      </div>

      {/* Economie estimata */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ color: 'var(--neutru)', textTransform: 'uppercase' }}>
          Economie anuală estimată {scop === 'arges' ? '(județ)' : '(național)'}:
        </span>
        <span className="mono-num" style={{ fontSize: '17px', fontWeight: 600, color: 'var(--semnal)' }}>
          {formatRon(economieTotala)}
        </span>
      </div>
    </footer>
  );
};
