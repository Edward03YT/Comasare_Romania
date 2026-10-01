import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import fara SSR deoarece Leaflet necesita obiectul window
export const HartaWrapper = dynamic(
  () => import('./HartaUat').then((mod) => mod.HartaUat),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--hartie)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--cerneala)',
          fontFamily: 'var(--font-condensed)',
          fontSize: '14px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Se inițializează instrumentul cadastral…
      </div>
    ),
  }
);
