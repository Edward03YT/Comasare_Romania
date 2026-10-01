import React, { useState } from 'react';

export const Legenda: React.FC = () => {
  const [deschisa, setDeschisa] = useState<boolean>(true);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 900,
        backgroundColor: 'var(--cerneala)',
        border: '1px solid var(--neutru)',
        borderRadius: '2px',
        color: 'var(--hartie)',
        boxShadow: 'none',
        minWidth: deschisa ? '200px' : 'auto',
        userSelect: 'none',
      }}
    >
      {/* Antet colapsabil */}
      <div
        onClick={() => setDeschisa((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          cursor: 'pointer',
          backgroundColor: '#151C25',
          borderBottom: deschisa ? '1px solid rgba(139, 132, 120, 0.3)' : 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
            color: 'var(--hartie)',
          }}
        >
          Legendă
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--neutru)',
            marginLeft: '8px',
            lineHeight: 1,
          }}
        >
          {deschisa ? '[−]' : '[+]'}
        </span>
      </div>

      {/* Corpul legendei — doar cele 3 stari de date din DESIGN.md */}
      {deschisa && (
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {/* Alerta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#B23A2E',
                border: '1px solid rgba(27, 36, 48, 0.6)',
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--hartie)' }}>
              Alertă (sub prag)
            </span>
          </div>

          {/* Sanatos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#4C6B4F',
                border: '1px solid rgba(27, 36, 48, 0.6)',
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--hartie)' }}>
              Sănătos (peste prag)
            </span>
          </div>

          {/* Neutru */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#8B8478',
                border: '1px solid rgba(27, 36, 48, 0.6)',
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--hartie)' }}>
              Neutru (date indisponibile)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
