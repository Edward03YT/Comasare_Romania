import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface UatItemCautare {
  siruta: number;
  nume: string;
  judet: string;
  tip: string;
  populatie?: number;
}

interface BaraCautareProps {
  listaUat: UatItemCautare[];
  peSelectie: (siruta: number) => void;
}

// Normalizare caractere si diacritice romanesti
function normaliseazaText(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const BaraCautare: React.FC<BaraCautareProps> = ({ listaUat, peSelectie }) => {
  const [termen, setTermen] = useState<string>('');
  const [termenDebounced, setTermenDebounced] = useState<string>('');
  const [deschis, setDeschis] = useState<boolean>(false);
  const [indexSelectat, setIndexSelectat] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce ~250ms conform cerintei
  useEffect(() => {
    const handler = setTimeout(() => {
      setTermenDebounced(termen);
    }, 250);

    return () => clearTimeout(handler);
  }, [termen]);

  // Click in afara pentru inchidere meniu
  useEffect(() => {
    const handleClickAfara = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDeschis(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfara);
    return () => document.removeEventListener('mousedown', handleClickAfara);
  }, []);

  // Filtrare rezultate dupa nume sau judet
  const rezultate = useMemo(() => {
    const q = normaliseazaText(termenDebounced);
    if (!q || q.length < 2) return [];

    const gasite: UatItemCautare[] = [];
    for (const item of listaUat) {
      const numeNorm = normaliseazaText(item.nume);
      const judetNorm = normaliseazaText(item.judet);

      if (numeNorm.includes(q) || judetNorm.includes(q)) {
        gasite.push(item);
        if (gasite.length >= 15) break; // Limita de 15 rezultate pentru usurinta navigarii
      }
    }
    return gasite;
  }, [termenDebounced, listaUat]);

  const handleSelecteazaItem = (siruta: number) => {
    peSelectie(siruta);
    setDeschis(false);
    setTermen('');
    setIndexSelectat(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!deschis || rezultate.length === 0) {
      if (e.key === 'ArrowDown' && rezultate.length > 0) {
        setDeschis(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndexSelectat((prev) => (prev < rezultate.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndexSelectat((prev) => (prev > 0 ? prev - 1 : rezultate.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (indexSelectat >= 0 && indexSelectat < rezultate.length) {
        handleSelecteazaItem(rezultate[indexSelectat].siruta);
      } else if (rezultate.length > 0) {
        handleSelecteazaItem(rezultate[0].siruta);
      }
    } else if (e.key === 'Escape') {
      setDeschis(false);
      setIndexSelectat(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '190px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={termen}
        placeholder="Caută UAT sau județ…"
        onChange={(e) => {
          setTermen(e.target.value);
          setDeschis(true);
          setIndexSelectat(-1);
        }}
        onFocus={() => {
          if (rezultate.length > 0) setDeschis(true);
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '30px',
          backgroundColor: '#151C25',
          border: '1px solid var(--neutru)',
          borderRadius: '2px',
          color: 'var(--hartie)',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          padding: '0 26px 0 10px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Buton curatare */}
      {termen && (
        <button
          onClick={() => {
            setTermen('');
            setDeschis(false);
            if (inputRef.current) inputRef.current.focus();
          }}
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--neutru)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '2px',
            lineHeight: 1,
          }}
          title="Șterge căutarea"
        >
          ×
        </button>
      )}

      {/* Lista Autocomplete — simpla, hairline divider Neutru, fara umbre/carduri */}
      {deschis && rezultate.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '300px',
            maxHeight: '340px',
            overflowY: 'auto',
            backgroundColor: 'var(--cerneala)',
            border: '1px solid var(--neutru)',
            borderRadius: '2px',
            zIndex: 2500,
            boxShadow: 'none',
          }}
        >
          {rezultate.map((item, idx) => {
            const esteActiv = idx === indexSelectat;
            return (
              <div
                key={`cautare-${item.siruta}`}
                onClick={() => handleSelecteazaItem(item.siruta)}
                onMouseEnter={() => setIndexSelectat(idx)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--hartie)',
                  backgroundColor: esteActiv ? '#242E3D' : 'transparent',
                  borderBottom:
                    idx < rezultate.length - 1
                      ? '1px solid rgba(139, 132, 120, 0.25)'
                      : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 100ms ease',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{item.nume}</span>
                  <span style={{ color: 'var(--neutru)', marginLeft: '4px' }}>
                    — {item.tip}, {item.judet}
                  </span>
                </div>
                {item.populatie !== undefined && item.populatie > 0 && (
                  <span
                    className="mono-num"
                    style={{
                      fontSize: '11px',
                      color: 'var(--neutru)',
                      marginLeft: '8px',
                      flexShrink: 0,
                    }}
                  >
                    {item.populatie.toLocaleString('ro-RO')} loc.
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {deschis && termenDebounced.length >= 2 && rezultate.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            padding: '8px 12px',
            fontSize: '12px',
            fontFamily: 'var(--font-sans)',
            color: 'var(--neutru)',
            backgroundColor: 'var(--cerneala)',
            border: '1px solid var(--neutru)',
            borderRadius: '2px',
            zIndex: 2500,
          }}
        >
          Niciun rezultat pentru „{termenDebounced}”
        </div>
      )}
    </div>
  );
};
