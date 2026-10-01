import React from 'react';
import { UatProperties } from '@/lib/types';
import { formatNum, formatRon } from '@/lib/formatters';

interface PanouEditareProps {
  selectateIds: number[];
  toateUatMap: Map<number, UatProperties>;
  peUneste: () => void;
  peAnuleazaSelectie: () => void;
  peReseteazaManuale: () => void;
  nrGrupuriManuale: number;
}

export const PanouEditare: React.FC<PanouEditareProps> = ({
  selectateIds,
  toateUatMap,
  peUneste,
  peAnuleazaSelectie,
  peReseteazaManuale,
  nrGrupuriManuale,
}) => {
  let populatieCumulata = 0;
  let cheltFunctionareCumulate = 0;

  for (const id of selectateIds) {
    const uat = toateUatMap.get(id);
    if (uat) {
      populatieCumulata += uat.populatie;
      cheltFunctionareCumulate += uat.cheltuieli_functionare;
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        left: '20px',
        width: '320px',
        backgroundColor: 'var(--cerneala)',
        border: '1px solid var(--semnal)',
        borderRadius: '2px',
        padding: '16px',
        zIndex: 850,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--semnal)', textTransform: 'uppercase' }}>
          Editare manuală comasare
        </span>
        <span className="mono-num" style={{ fontSize: '11px', color: 'var(--neutru)' }}>
          {selectateIds.length} selectate
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--neutru)', lineHeight: 1.4, marginBottom: '14px' }}>
        Apasă pe două sau mai multe UAT-uri vecine pe hartă pentru a le include în grupul manual.
      </p>

      {selectateIds.length > 0 && (
        <div style={{ border: '1px solid var(--neutru)', padding: '10px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--neutru)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Selecție curentă:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {selectateIds.map((id) => (
              <span
                key={id}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  border: '1px solid var(--semnal)',
                  color: 'var(--semnal)',
                }}
              >
                {toateUatMap.get(id)?.nume || id}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
            <span style={{ color: 'var(--neutru)' }}>Populație cumulată:</span>
            <span className="mono-num" style={{ fontWeight: 600 }}>{formatNum(populatieCumulata)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--neutru)' }}>Cheltuieli funcționare:</span>
            <span className="mono-num" style={{ fontWeight: 600 }}>{formatRon(cheltFunctionareCumulate)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={peUneste}
          disabled={selectateIds.length < 2}
          className="btn-semnal-solid"
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            opacity: selectateIds.length < 2 ? 0.4 : 1,
            cursor: selectateIds.length < 2 ? 'not-allowed' : 'pointer',
          }}
        >
          Unește comunele selectate
        </button>

        {selectateIds.length > 0 && (
          <button
            onClick={peAnuleazaSelectie}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderColor: 'var(--neutru)',
            }}
          >
            Anulează selecția
          </button>
        )}

        {nrGrupuriManuale > 0 && (
          <button
            onClick={peReseteazaManuale}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderColor: 'var(--alerta)',
              color: 'var(--alerta)',
              marginTop: '4px',
            }}
          >
            Resetează toate grupurile manuale ({nrGrupuriManuale})
          </button>
        )}
      </div>
    </div>
  );
};
