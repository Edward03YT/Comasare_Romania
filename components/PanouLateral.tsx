import React from 'react';
import { UatProperties, GrupComasare } from '@/lib/types';
import { formatNum, formatRon } from '@/lib/formatters';

interface PanouLateralProps {
  uat: UatProperties | null;
  grupAsociat: GrupComasare | null;
  toateUatMap: Map<number, UatProperties>;
  pragPopulatie: number;
  peInchidere: () => void;
  peDizolvaGrup?: (grupId: string) => void;
}

interface LinieCitireProps {
  eticheta: string;
  valoare: number;
  valoareMaxima: number;
  esteCheltuiala: boolean;
  venituriProprii: number;
}

// Componenta de bara de citire conform DESIGN.md:
// - eticheta mica deasupra: IBM Plex Sans, Neutru
// - bara orizontala de magnitudine: proportionala cu max-ul din panoul CURENT
// - valoare in RON scrisa mare: IBM Plex Mono, tabular-nums
// - culoare: default Paper/Neutru (ton discret de ledger); daca cheltuiala > venituri proprii -> Alerta
const LinieCitire: React.FC<LinieCitireProps> = ({
  eticheta,
  valoare,
  valoareMaxima,
  esteCheltuiala,
  venituriProprii,
}) => {
  const procent = valoareMaxima > 0
    ? Math.min(100, Math.max(0, (valoare / valoareMaxima) * 100))
    : 0;

  const depasesteVenituri = esteCheltuiala && valoare > venituriProprii;
  const culoareBara = depasesteVenituri ? 'var(--alerta)' : 'var(--neutru)';

  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--neutru)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {eticheta}
        </span>
        <span
          className="mono-num"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: depasesteVenituri ? 'var(--alerta)' : 'var(--hartie)',
          }}
        >
          {formatRon(valoare)}
        </span>
      </div>

      {/* Bara orizontala de magnitudine */}
      <div
        style={{
          width: '100%',
          height: '7px',
          backgroundColor: 'rgba(139, 132, 120, 0.16)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${procent}%`,
            height: '100%',
            backgroundColor: culoareBara,
            transition: 'width 240ms ease-out',
          }}
        />
      </div>
    </div>
  );
};

export const PanouLateral: React.FC<PanouLateralProps> = ({
  uat,
  grupAsociat,
  toateUatMap,
  pragPopulatie,
  peInchidere,
  peDizolvaGrup,
}) => {
  if (!uat) return null;

  const esteSubPrag = uat.populatie < pragPopulatie;

  // Calcul magnitudine pentru UAT curent
  const uatVenituriProprii = uat.venituri_proprii;
  const uatCheltAdmin = uat.exec_personnel;
  const uatCheltPersonalTotal = uat.chelt_personal;
  const uatCheltFunctionare = uat.cheltuieli_functionare;
  const uatCheltDezvoltare = uat.cheltuieli_dezvoltare;
  const uatImpozitVenit = uat.impozit_venit_colectat ?? 0;

  const maxValoareUat = Math.max(
    uatVenituriProprii,
    uatCheltAdmin,
    uatCheltPersonalTotal,
    uatCheltFunctionare,
    uatCheltDezvoltare,
    uatImpozitVenit,
    1
  );

  // Calcul cifre agregate pentru grup (daca exista grup asociat)
  let grupVenituriProprii = 0;
  let grupCheltAdmin = 0;
  let grupCheltPersonalTotal = 0;
  let grupCheltFunctionare = 0;
  let grupCheltDezvoltare = 0;
  let grupImpozitVenit = 0;

  if (grupAsociat) {
    for (const membruId of grupAsociat.membri) {
      const m = toateUatMap.get(membruId);
      if (m) {
        grupVenituriProprii += m.venituri_proprii;
        grupCheltAdmin += m.exec_personnel;
        grupCheltPersonalTotal += m.chelt_personal;
        grupCheltFunctionare += m.cheltuieli_functionare;
        grupCheltDezvoltare += m.cheltuieli_dezvoltare;
        grupImpozitVenit += m.impozit_venit_colectat ?? 0;
      }
    }
  }

  const maxValoareGrup = Math.max(
    grupVenituriProprii,
    grupCheltAdmin,
    grupCheltPersonalTotal,
    grupCheltFunctionare,
    grupCheltDezvoltare,
    grupImpozitVenit,
    1
  );

  return (
    <aside
      style={{
        position: 'absolute',
        top: '56px',
        right: 0,
        bottom: '48px',
        width: '400px',
        backgroundColor: 'var(--cerneala)',
        borderLeft: '1px solid var(--neutru)',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transition: 'transform 220ms ease-out',
        padding: '24px 22px',
      }}
    >
      {/* Header UAT */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '18px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--neutru)', fontFamily: 'var(--font-mono)' }}>
            SIRUTA {uat.siruta} · {uat.judet}
          </span>
          <h2 style={{ fontSize: '21px', margin: '4px 0 2px 0', textTransform: 'uppercase' }}>
            {uat.nume}
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--neutru)' }}>{uat.tip}</span>
        </div>
        <button
          onClick={peInchidere}
          style={{
            padding: '4px 8px',
            fontSize: '14px',
            border: '1px solid var(--neutru)',
            lineHeight: 1,
          }}
          aria-label="Închide panoul"
        >
          ✕
        </button>
      </div>

      {/* Populatie UAT */}
      <div
        style={{
          border: '1px solid var(--neutru)',
          padding: '12px 14px',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(239, 234, 224, 0.02)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--neutru)', textTransform: 'uppercase' }}>
            Populație (Recensământ 2021)
          </div>
          <div className="mono-num" style={{ fontSize: '22px', fontWeight: 600 }}>
            {formatNum(uat.populatie)}{' '}
            <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--neutru)' }}>
              locuitori
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            border: `1px solid ${esteSubPrag ? 'var(--alerta)' : 'var(--sanatos)'}`,
            color: esteSubPrag ? 'var(--alerta)' : 'var(--sanatos)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {esteSubPrag ? 'Sub prag' : 'Peste prag'}
        </span>
      </div>

      {/* Sectiune Bare de Citire UAT */}
      <div style={{ marginBottom: '26px' }}>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--neutru)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '18px',
            borderBottom: '1px solid rgba(139, 132, 120, 0.3)',
            paddingBottom: '6px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Bare bugetare UAT (magnitudine relativă)</span>
        </div>

        {!uat.are_date_buget ? (
          <div style={{ fontSize: '13px', color: 'var(--neutru)', fontStyle: 'italic', padding: '14px 0' }}>
            Date bugetare indisponibile pentru acest UAT.
          </div>
        ) : (
          <div>
            <LinieCitire
              eticheta="Venituri proprii"
              valoare={uatVenituriProprii}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={false}
              venituriProprii={uatVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli personal administrativ"
              valoare={uatCheltAdmin}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={true}
              venituriProprii={uatVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli personal total"
              valoare={uatCheltPersonalTotal}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={true}
              venituriProprii={uatVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli funcționare"
              valoare={uatCheltFunctionare}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={true}
              venituriProprii={uatVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli dezvoltare"
              valoare={uatCheltDezvoltare}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={true}
              venituriProprii={uatVenituriProprii}
            />

            <LinieCitire
              eticheta="Impozit pe venit colectat"
              valoare={uatImpozitVenit}
              valoareMaxima={maxValoareUat}
              esteCheltuiala={false}
              venituriProprii={uatVenituriProprii}
            />
          </div>
        )}
      </div>

      {/* Sectiune Grup de Comasare cu bare de citire agregate */}
      {grupAsociat && (
        <div
          style={{
            borderTop: '1px solid var(--neutru)',
            paddingTop: '20px',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: 'var(--semnal)',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {grupAsociat.este_manual ? 'Grup comasare manual' : 'Grup comasare propus'}
            </span>
            {grupAsociat.este_manual && peDizolvaGrup && (
              <button
                onClick={() => peDizolvaGrup(grupAsociat.id)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderColor: 'var(--alerta)',
                  color: 'var(--alerta)',
                }}
              >
                Dizolvă grupul
              </button>
            )}
          </div>

          <div style={{ fontSize: '12px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--neutru)' }}>UAT principal (structură păstrată): </span>
            <strong style={{ color: 'var(--hartie)' }}>
              {toateUatMap.get(grupAsociat.uat_principal)?.nume || grupAsociat.uat_principal}
            </strong>
          </div>

          <div style={{ fontSize: '12px', marginBottom: '14px' }}>
            <span style={{ color: 'var(--neutru)' }}>
              Comune / orașe în grup ({grupAsociat.membri.length}):{' '}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {grupAsociat.membri.map((mId) => {
                const membru = toateUatMap.get(mId);
                const estePrincipal = mId === grupAsociat.uat_principal;
                return (
                  <span
                    key={mId}
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      border: '1px solid var(--neutru)',
                      backgroundColor: estePrincipal ? 'rgba(201, 162, 39, 0.15)' : 'transparent',
                      color: estePrincipal ? 'var(--semnal)' : 'var(--hartie)',
                    }}
                  >
                    {membru ? membru.nume : mId}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bare de citire bugetare pentru Grupul comasat */}
          <div style={{ marginTop: '14px', marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--neutru)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '14px',
                borderBottom: '1px solid rgba(139, 132, 120, 0.25)',
                paddingBottom: '4px',
              }}
            >
              Bare bugetare grup comasat (cumulat)
            </div>

            <LinieCitire
              eticheta="Venituri proprii grup"
              valoare={grupVenituriProprii}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={false}
              venituriProprii={grupVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli personal admin grup"
              valoare={grupCheltAdmin}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={true}
              venituriProprii={grupVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli personal total grup"
              valoare={grupCheltPersonalTotal}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={true}
              venituriProprii={grupVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli funcționare grup"
              valoare={grupCheltFunctionare}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={true}
              venituriProprii={grupVenituriProprii}
            />

            <LinieCitire
              eticheta="Cheltuieli dezvoltare grup"
              valoare={grupCheltDezvoltare}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={true}
              venituriProprii={grupVenituriProprii}
            />

            <LinieCitire
              eticheta="Impozit pe venit grup"
              valoare={grupImpozitVenit}
              valoareMaxima={maxValoareGrup}
              esteCheltuiala={false}
              venituriProprii={grupVenituriProprii}
            />
          </div>

          {/* Rezumat financiar grup */}
          <div
            style={{
              border: '1px solid var(--neutru)',
              padding: '12px',
              backgroundColor: 'rgba(239, 234, 224, 0.02)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '6px',
              }}
            >
              <span style={{ color: 'var(--neutru)' }}>Populație cumulată:</span>
              <span className="mono-num" style={{ fontWeight: 600 }}>
                {formatNum(grupAsociat.populatie_totala)} loc.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--neutru)' }}>Economie anuală estimată:</span>
              <span
                className="mono-num"
                style={{ fontWeight: 600, color: 'var(--semnal)', fontSize: '16px' }}
              >
                {formatRon(grupAsociat.economie_estimata)}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
