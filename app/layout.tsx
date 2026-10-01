import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = {
  title: 'Harta Comasărilor Administrative — România',
  description: 'Instrument cadastral și fiscal pentru simularea scenariilor de comasare a unităților administrativ-teritoriale din România pe baza datelor din Recensământul 2021 și execuția bugetară.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
